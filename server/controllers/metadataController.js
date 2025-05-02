import { createSalesforceConnection } from "../config/salesforce.js";
import {
  buildFieldMetadata,
  buildFieldPermissions,
} from "../utils/salesforceFields.js";

const STANDARD_FIELDS = new Set([
  "Id",
  "IsDeleted",
  "CreatedDate",
  "CreatedById",
  "LastModifiedDate",
  "LastModifiedById",
  "SystemModstamp",
  "OwnerId",
  "Name",
]);

function normalizeType(sfType) {
  const t = (sfType || "").toLowerCase();
  if (["string", "textarea", "email", "phone"].includes(t)) return "text";
  if (["double", "integer", "long", "currency", "percent"].includes(t))
    return "number";
  if (["date", "datetime"].includes(t)) return "date";
  if (t === "boolean") return "boolean";
  if (["picklist", "multipicklist"].includes(t)) return "picklist";
  return t;
}

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

    // parse CSV payload and normalize each record to have .apiName + .dataType
    const csvFields = JSON.parse(fieldsFromCsv).map((f) => {
      const apiName = f.fieldApiName || f.apiName || f["Field API Name"];
      const rawType = f.dataType || f["Data Type"] || "";
      const dataType = rawType.toLowerCase();
      return { ...f, apiName, dataType };
    });

    const conn = createSalesforceConnection(req.session.user);

    // // fetch the actual SObject’s field descriptions
    // const describeResult = await conn.sobject(objectName).describe();
    // const sfFields = describeResult.fields;

    // fetch the CustomObject’s metadata so we get all custom fields immediately
    const customObjMd = await conn.metadata.read("CustomObject", objectName);
    const sfFields = customObjMd.fields || [];

    // const existing = sfFields.map((f) => ({
    //   name: f.name,
    //   label: f.label,
    //   type: normalizeType(f.type),
    // }));

    // build a simple map of API-name → label/type
    const existing = sfFields.map((f) => {
      const full = f.fullName || f.name;
      const apiName = full.includes(".") ? full.split(".").pop() : full;
      return {
        name: apiName,
        label: f.label,
        type: normalizeType(f.type),
      };
    });

    // lookups
    const csvByApi = Object.fromEntries(csvFields.map((f) => [f.apiName, f]));
    const sfByName = Object.fromEntries(existing.map((f) => [f.name, f]));

    // 1) in CSV but not in SF
    const missingInSalesforce = csvFields.filter(
      (f) => !sfByName[f.apiName] && !STANDARD_FIELDS.has(f.apiName)
    );

    // 2) in SF but not in CSV, ignore standard fields
    const missingInCsv = existing.filter(
      (f) => !csvByApi[f.name] && !STANDARD_FIELDS.has(f.name)
    );

    // 3) type mismatches (only for __c fields)
    const typeMismatches = csvFields
      .filter((f) => sfByName[f.apiName] && f.apiName.endsWith("__c"))
      .filter((f) => sfByName[f.apiName].type !== f.dataType.toLowerCase());

    // 4) suggestions
    const suggestions = [];

    missingInSalesforce.forEach((f) =>
      suggestions.push({
        field: f.apiName,
        action: "create",
        details: `Create field "${f.apiName}" of type "${f.dataType}"`,
      })
    );
    missingInCsv.forEach((f) =>
      suggestions.push({
        field: f.name,
        action: "removeOrReview",
        details: `Field "${f.name}" exists in Salesforce but not in CSV`,
      })
    );
    typeMismatches.forEach((f) => {
      const from = sfByName[f.apiName].type;
      const to = f.dataType.toLowerCase();
      suggestions.push({
        field: f.apiName,
        action: "updateType",
        details: `Change type of "${f.apiName}" from "${from}" to "${to}"`,
      });
    });

    return res.status(200).json({
      missingInSalesforce,
      missingInCsv,
      typeMismatches,
      suggestions,
    });
  } catch (error) {
    console.error("[Compare Metadata Error]", error);
    return res.status(500).json({ message: error.message });
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
    return res.status(500).json({
      success: false,
      message: "Failed to list profiles",
      error: err.message,
    });
  }
}
