import { parse } from "csv-parse/sync";
import fs from "fs";

const VALID_DATA_TYPES = ["text", "number", "date", "picklist"];
const BOOLEAN_VALUES = ["true", "false"];

export function csvParser(filePath) {
  const csvData = fs.readFileSync(filePath, "utf-8");

  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  const errors = [];

  records.forEach((row, index) => {
    const rowNumber = index + 2;

    if (!row["Field API Name"] || !row["Field API Name"].endsWith("__c")) {
      errors.push(`Row ${rowNumber}: 'Field API Name' must end with '__c'.`);
    }
    if (!row["Field Label"] || row["Field Label"].length > 255) {
      errors.push(
        `Row ${rowNumber}: 'Field Label' is required and should be under 255 characters.`
      );
    }
    if (!VALID_DATA_TYPES.includes(row["Data Type"])) {
      errors.push(
        `Row ${rowNumber}: 'Data Type' must be one of ${VALID_DATA_TYPES.join(
          ", "
        )}.`
      );
    }
    ["Required", "Unique", "Case Sensitive"].forEach((field) => {
      const val = row[field];
      if (val && !BOOLEAN_VALUES.includes(val.toLowerCase())) {
        errors.push(`Row ${rowNumber}: '${field}' must be 'true' or 'false'.`);
      }
    });
    if (row["External ID"] && row["External ID"].length > 255) {
      errors.push(
        `Row ${rowNumber}: 'External ID' must be under 255 characters.`
      );
    }
    if (row["Data Type"] === "picklist") {
      if (!row["Picklist Options"]) {
        errors.push(
          `Row ${rowNumber}: 'Picklist Options' must be provided for picklist fields.`
        );
      } else {
        const opts = row["Picklist Options"].split("|").map((o) => o.trim());
        if (opts.length === 0) {
          errors.push(
            `Row ${rowNumber}: 'Picklist Options' must contain at least one option.`
          );
        }
      }
    }
  });

  if (errors.length) {
    const validationError = new Error("CSV Validation Failed");
    validationError.details = errors;
    throw validationError;
  }

  return records;
}

const defaultExport = {
  parseFile: csvParser,
};

export default defaultExport;
