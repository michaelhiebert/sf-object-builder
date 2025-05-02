import { createSalesforceConnection } from "../config/salesforce.js";
import {
  buildFieldMetadata,
  buildFieldPermissions,
} from "../utils/salesforceFields.js";

export async function upsertMetadata(req, res) {
  const conn = createSalesforceConnection(req.user);

  try {
    const results = await conn.metadata.upsert("CustomObject", req.body);
    const errors = results
      .filter((r) => !r.success)
      .map((r) => JSON.stringify(r.errors));

    if (errors.length) {
      return res.status(400).send(errors);
    }

    return res.send(results);
  } catch (error) {
    return res.status(500).json(error);
  }
}

export async function compareMetadata(req, res) {
  try {
    const { objectName, fieldsFromCsv } = req.query;

    if (!objectName || !fieldsFromCsv) {
      return res
        .status(400)
        .json({ message: "Missing objectName or fieldsFromCsv" });
    }

    const parsedFieldsFromCsv = JSON.parse(fieldsFromCsv);

    const conn = createSalesforceConnection(req.session.user);
    const metadata = await conn.describe(objectName);

    const existingFields = metadata.fields.map((f) => ({
      name: f.name,
      label: f.label,
      type: f.type,
    }));

    // Simple comparison
    const missingInSalesforce = parsedFieldsFromCsv.filter(
      (csvField) =>
        !existingFields.some((sfField) => sfField.name === csvField.apiName)
    );

    const missingInCsv = existingFields.filter(
      (sfField) =>
        !parsedFieldsFromCsv.some(
          (csvField) => csvField.apiName === sfField.name
        )
    );

    const typeMismatches = parsedFieldsFromCsv.filter((csvField) => {
      const sfField = existingFields.find((f) => f.name === csvField.apiName);
      return (
        sfField &&
        sfField.type.toLowerCase() !== csvField.dataType.toLowerCase()
      );
    });

    return res.status(200).json({
      missingInSalesforce,
      missingInCsv,
      typeMismatches,
    });
  } catch (error) {
    console.error("[Compare Metadata Error]", error);
    return res
      .status(500)
      .json({ message: "Failed to compare metadata", error: error.message });
  }
}

export async function compareFields(req, res) {
  try {
    const { objectName, fieldsFromCsv } = req.query;

    if (!objectName || !fieldsFromCsv) {
      return res
        .status(400)
        .json({ message: "Missing objectName or fieldsFromCsv" });
    }

    const parsedCsvFields = JSON.parse(fieldsFromCsv);

    // Mock response: assume Salesforce has only two fields
    const salesforceFields = [
      { apiName: "Field1__c", dataType: "text" },
      { apiName: "Field2__c", dataType: "number" },
    ];

    const missingInSalesforce = parsedCsvFields.filter(
      (field) => !salesforceFields.find((sf) => sf.apiName === field.apiName)
    );

    const typeMismatches = parsedCsvFields.filter((field) => {
      const sfField = salesforceFields.find(
        (sf) => sf.apiName === field.apiName
      );
      return sfField && sfField.dataType !== field.dataType;
    });

    const missingInCsv = salesforceFields.filter(
      (sf) => !parsedCsvFields.find((field) => field.apiName === sf.apiName)
    );

    res.json({
      missingInSalesforce,
      missingInCsv,
      typeMismatches,
    });
  } catch (error) {
    console.error("Error comparing fields:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createSalesforceObject(req, res) {
  try {
    // const { objectName, fields } = req.body;
    const { objectName, fields, profileName: requestedProfile } = req.body;

    if (!objectName || !fields?.length) {
      return res.status(400).json({
        success: false,
        message: "Missing object name or field definitions.",
      });
    }

    if (!req.session?.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const conn = createSalesforceConnection(req.session.user);
    const label = objectName.replace(/__c$/, "").replace(/_/g, " ");

    await conn.metadata.create("CustomObject", {
      fullName: objectName,
      label,
      pluralLabel: label + "s",
      nameField: { type: "Text", label: "Name" },
      deploymentStatus: "Deployed",
      sharingModel: "ReadWrite",
    });

    const fieldDefinitions = buildFieldMetadata(objectName, fields);
    console.log("Creating fields:", JSON.stringify(fieldDefinitions, null, 2));
    await conn.metadata.create("CustomField", fieldDefinitions);

    try {
      // // TODO make this dynamic
      // const profileName = "Standard";
      // allow dynamic profile selection, default to "Standard"
      const profileName = requestedProfile || "Standard";

      const { permissions, skipped } = buildFieldPermissions(
        objectName,
        fields
      );
      if (skipped.length) {
        console.warn("Skipped required fields for FLS:", skipped);
        // include skipped info in the response
        res.locals.skippedFieldPermissions = skipped;
      }

      // Only send the fields we want to update — not the full profile object
      const updateResult = await conn.metadata.update("Profile", {
        fullName: profileName,
        fieldPermissions: permissions,
      });

      console.log("Field permissions updated:", updateResult);
    } catch (permError) {
      console.warn("Field-level permission update failed:", permError.message);
    }

    res.json({
      success: true,
      message: `Custom object ${objectName} and ${fields.length} fields created.`,
      skippedFieldPermissions: res.locals.skippedFieldPermissions || [],
    });
  } catch (error) {
    console.error("Salesforce object creation failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Salesforce object",
      error: error.message,
    });
  }
}

export async function listProfiles(req, res) {
  try {
    if (!req.session?.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const conn = createSalesforceConnection(req.session.user);

    // Fetch all Profile metadata entries
    const raw = await conn.metadata.list({ type: "Profile" });
    const arr = Array.isArray(raw) ? raw : [raw];

    // Turn API fullName into a human label
    const profiles = arr.map((p) => ({
      fullName: p.fullName,
      label: p.fullName
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2") // split camelCase
        .trim(),
    }));

    return res.json({ success: true, profiles });
  } catch (err) {
    console.error("[List Profiles Error]", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to list profiles", error: err.message });
  }
}
