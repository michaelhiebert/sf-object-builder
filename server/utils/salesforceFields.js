export function mapToSalesforceFieldType(type) {
  const mapping = {
    text: "Text",
    number: "Number",
    date: "Date",
    picklist: "Picklist",
  };
  return mapping[type?.toLowerCase()] || "Text";
}

export function buildFieldMetadata(objectName, fields) {
  return fields.map((field) => {
    const type = mapToSalesforceFieldType(field["Data Type"]);
    const isText = type === "Text";
    const isNumber = type === "Number";
    const picklistOptions = Array.isArray(field["Picklist Options"])
      ? field["Picklist Options"]
      : String(field["Picklist Options"] || "").split("|");

    return {
      fullName: `${objectName}.${field["Field API Name"]?.trim() || "UnnamedField"}`,
      label: field["Field Label"]?.trim() || "Unnamed Field",
      type,
      description: field["Help Text"],
      required: field["Required"] === true || field["Required"] === "true",
      unique: field["Unique"] === true || field["Unique"] === "true",
      externalId:
        field["External ID"] === true || field["External ID"] === "true",
      caseSensitive:
        field["Case Sensitive"] === true || field["Case Sensitive"] === "true",
      ...(isText ? { length: 255 } : {}),
      ...(isNumber ? { precision: 18, scale: 2 } : {}),
      ...(type === "Picklist"
        ? {
            valueSet: {
              valueSetDefinition: {
                sorted: false,
                value: picklistOptions.map((option) => ({
                  fullName: option.trim(),
                  default: false,
                  label: option.trim(),
                })),
              },
            },
          }
        : {}),
    };
  });
}

export function buildFieldPermissions(objectName, fields) {
  const permissions = [];
  const skipped = [];

  for (const field of fields) {
    const isRequired =
      field["Required"] === true || field["Required"] === "true";

    if (isRequired) {
      skipped.push(field["Field API Name"]);
      continue;
    }

    permissions.push({
      field: `${objectName}.${field["Field API Name"]}`,
      readable: true,
      editable: true,
    });
  }

  return { permissions, skipped };
}
