import React, { useState } from "react";
import axios from "axios";

// UI components
import Alert from "./ui/Alert.jsx";
import Loading from "./ui/Loading.jsx";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setAlert({ type: "error", message: "Please select a file." });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsLoading(true);
    setAlert({ type: "info", message: "Uploading file..." });

    try {
      const response = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setAlert({
        type: "success",
        message: response.data?.message || "Upload successful!",
      });
    } catch (error) {
      console.error("Upload error:", error);
      setAlert({
        type: "error",
        message: error?.response?.data?.message || "Error uploading file.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert(null);
  };

  return (
    <div className="slds-modal slds-fade-in-open">
      <div className="slds-modal__container">
        <div className="slds-box slds-theme--shade">
          <p className="slds-text-heading--medium slds-m-bottom--medium">
            Upload your CSV:
          </p>

          {alert && <Alert alert={alert} handleClose={handleCloseAlert} />}
          {isLoading && <Loading />}
          <form
            className="slds-form--stacked slds-m-bottom--xx-large"
            onSubmit={handleUpload}
          >
            <div className="slds-form-element">
              <label
                className="slds-form-element__label slds-text-heading--medium"
                htmlFor="metadata"
              >
                Metadata
              </label>
              <div className="slds-form-element__control">
                <input type="file" onChange={handleFileChange} />
              </div>
            </div>

            <div className="slds-form-element slds-clearfix">
              <div className="slds-float--right">
                <button
                  className="slds-button slds-button--brand"
                  type="submit"
                  onClick={handleUpload}
                  disabled={isLoading}
                >
                  <svg
                    aria-hidden="true"
                    className="slds-button__icon--stateful slds-button__icon--left"
                  >
                    <use xlinkHref="/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                  </svg>
                  Upload
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
