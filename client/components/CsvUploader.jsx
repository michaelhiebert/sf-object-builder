import React, { useState, useEffect } from "react";
import axios from "axios";

// UI
import Alert from "./ui/Alert";
import Loading from "./ui/Loading.jsx";

const CsvUploader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fields, setFields] = useState([]);
  const [errors, setErrors] = useState([]);
  const [alert, setAlert] = useState(null);
  const [objectName, setObjectName] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileName, setSelectedProfileName] = useState("Standard");
  const [diffResult, setDiffResult] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setErrors([]);
    setFields([]);
    setAlert(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setAlert({
        type: "warning",
        message: "Please select a CSV file to upload.",
      });
      return;
    }

    // Get the inferred Object Name based on the filename
    const inferredObjectName = selectedFile.name.replace(/\.csv$/i, "");
    setObjectName(inferredObjectName);

    const formData = new FormData();
    formData.append("csvFile", selectedFile);
    formData.append("objectName", inferredObjectName);

    try {
      setIsLoading(true);

      const response = await axios.post("/api/upload/csv", formData);

      setFields(response.data.fields);
      setAlert({ type: "success", message: response.data.message });
    } catch (err) {
      const msg = err.response?.data?.message || "Error uploading CSV";
      setAlert({ type: "error", message: msg });

      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFields = async () => {
    try {
      setIsLoading(true);

      await axios.post("/api/metadata/create", {
        objectName,
        fields,
        profileName: selectedProfileName,
      });

      setIsLoading(false);

      setAlert({
        type: "success",
        autoDismiss: false,
        message: `Salesforce object "${objectName}" created successfully!`,
      });
    } catch (err) {
      console.error(err);

      setIsLoading(false);

      setAlert({
        type: "error",
        autoDismiss: false,
        message: err.response?.data?.message || "Failed to create object",
      });
    }
  };

  const handleCompare = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        objectName,
        fieldsFromCsv: JSON.stringify(fields),
      });
      const { data } = await axios.get(`/api/metadata/compare?${params}`);

      setDiffResult(data);
    } catch (err) {
      console.log(err.response.data.message);
      setAlert({
        type: "error",
        autoDismiss: false,
        message: err.response?.data?.message || "Compare failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get("/api/metadata/profiles")
      .then((resp) => setProfiles(resp.data.profiles || []))
      .catch((err) => {
        console.warn("Could not load profiles:", err);
        // fall back to Standard only
        setProfiles([{ fullName: "Standard", label: "Standard User" }]);
      });
  }, []);

  return (
    <div className="slds-box slds-theme_default">
      <h2 className="slds-text-heading--medium slds-m-bottom_medium">
        Upload CSV
      </h2>

      {alert && (
        <Alert
          alert={alert}
          handleClose={() => setAlert(null)}
          autoDismiss={alert.autoDismiss ?? true}
          dismissAfter={alert.dismissAfter}
        />
      )}

      {isLoading && <Loading />}

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="slds-m-bottom_small"
      />

      <button
        className="slds-button slds-button_brand"
        onClick={handleUpload}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Upload"}
      </button>

      {errors.length > 0 && (
        <div className="slds-m-top_medium">
          <h3 className="slds-text-heading--small">Validation Errors:</h3>
          <ul className="slds-list_dotted slds-m-left_medium">
            {errors.map((err, idx) => (
              <li key={idx} className="slds-text-color_error">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {fields.length > 0 ? (
        <div className="slds-m-top_medium">
          <h3 className="slds-text-heading--small">
            <strong>{objectName}</strong> Parsed Fields:
          </h3>

          {/* PROFILE SELECTOR */}
          <div className="slds-form-element slds-m-bottom_small">
            <label className="slds-form-element__label" htmlFor="profileSelect">
              Choose Profile for FLS
            </label>
            <div className="slds-form-element__control">
              <select
                id="profileSelect"
                className="slds-select"
                value={selectedProfileName}
                onChange={(e) => setSelectedProfileName(e.target.value)}
              >
                {profiles.map((p) => (
                  <option key={p.fullName} value={p.fullName}>
                    {p.label || p.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <table className="slds-table slds-table_cell-buffer slds-m-top--small">
            <thead>
              <tr>
                {Object.keys(fields[0]).map((key) => (
                  <th key={key} scope="col">
                    {key}
                  </th>
                ))}
                <th>Picklist values</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, i) => (
                <tr key={i}>
                  {Object.values(field).map((value, j) => (
                    <td key={j}>
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="slds-button slds-m-top--small slds-m-right--small"
            onClick={handleCompare}
          >
            Compare Fields with Salesforce
          </button>
          <button
            className="slds-button slds-button_brand slds-m-top--small"
            onClick={handleCreateFields}
          >
            Create Fields in Salesforce
          </button>
        </div>
      ) : (
        <p className="slds-text-body_small slds-m-top--small">
          No fields to display.
        </p>
      )}

      {/* === schema diff === */}
      {/* {diffResult && (
        <div className="slds-box slds-theme_shade slds-m-top--medium">
          <h3 className="slds-text-heading--small">Schema Differences</h3>

          <section className="slds-m-top--small">
            <strong>Missing in Salesforce:</strong>
            <ul>
              {diffResult.missingInSalesforce.map((f, i) => (
                <li key={i}>{f.name || f.apiName}</li>
              ))}
            </ul>
          </section>

          <section className="slds-m-top--small">
            <strong>Missing in CSV:</strong>
            <ul>
              {diffResult.missingInCsv.map((f, i) => (
                <li key={i}>{f.name || f.apiName}</li>
              ))}
            </ul>
          </section>

          <section className="slds-m-top--small">
            <strong>Type Mismatches:</strong>
            <ul>
              {diffResult.typeMismatches.map((f, i) => (
                <li key={i}>
                  {f.apiName}: CSV “{f.dataType}” vs SF “{f.type}”
                </li>
              ))}
            </ul>
          </section>
        </div>
      )} */}

      {diffResult && (
        <div className="slds-box slds-theme_shade slds-m-top--medium">
          <h3 className="slds-text-heading--small">Schema Differences</h3>

          {diffResult.missingInSalesforce.length === 0 &&
          diffResult.missingInCsv.length === 0 &&
          diffResult.typeMismatches.length === 0 ? (
            <p className="slds-p-around_medium">No schema differences found.</p>
          ) : (
            <>
              <section className="slds-m-top--small">
                <strong>Missing in Salesforce:</strong>
                <ul>
                  {diffResult.missingInSalesforce.map((f, i) => (
                    <li key={i}>{f.name || f.apiName}</li>
                  ))}
                </ul>
              </section>

              <section className="slds-m-top--small">
                <strong>Missing in CSV:</strong>
                <ul>
                  {diffResult.missingInCsv.map((f, i) => (
                    <li key={i}>{f.name || f.apiName}</li>
                  ))}
                </ul>
              </section>

              <section className="slds-m-top--small">
                <strong>Type Mismatches:</strong>
                <ul>
                  {diffResult.typeMismatches.map((f, i) => (
                    <li key={i}>
                      {f.apiName}: CSV “{f.dataType}” vs SF “{f.type}”
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CsvUploader;
