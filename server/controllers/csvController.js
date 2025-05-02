import fs from "fs";
import path from "path";
import csvParser from "../utils/csvParser.js";
import { createSalesforceConnection } from "../config/salesforce.js";

/**
 * Process the uploaded CSV file and create Salesforce records
 */
export async function processCsvUpload(req, res) {
  try {
    // File exists?
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Correct extension?
    if (!req.file.originalname.endsWith(".csv")) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Only CSV files are allowed",
      });
    }

    // Authenticated?
    if (!req.session?.user) {
      fs.unlinkSync(req.file.path);
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Infer Object Name
    const objectName = path.basename(req.file.originalname, ".csv");

    // Parse CSV
    const parsedFields = await csvParser.parseFile(req.file.path);

    // CSV empty?
    if (parsedFields.length === 0) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message: "CSV file is empty or contains no valid records",
      });
    }

    // Cleanup
    fs.unlinkSync(req.file.path);

    return res.status(200).json({
      success: true,
      message: "CSV parsed successfully",
      objectName,
      fields: parsedFields,
    });
  } catch (error) {
    console.error("CSV parse error:", error);
    return res.status(400).json({
      success: false,
      error: error.message,
      errors: error.details || [],
    });
  }
}

/**
 * List available Salesforce objects (for a UI dropdown)
 */
export async function getSalesforceObjects(req, res) {
  try {
    if (!req.session?.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const conn = createSalesforceConnection(req.session.user);
    const { sobjects } = await conn.describe();

    const objects = sobjects
      .filter((o) => o.createable)
      .map((o) => ({
        name: o.name,
        label: o.label,
        fields: o.fields,
      }));

    return res.json({ success: true, objects });
  } catch (err) {
    console.error("Error fetching Salesforce objects:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching Salesforce objects",
      error: err.message,
    });
  }
}
