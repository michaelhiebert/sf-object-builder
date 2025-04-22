import React, { useState } from "react";
import axios from "axios";

// UI components
import Alert from "./ui/Alert.jsx";
import Loading from "./ui/Loading.jsx";

const UpsertMetadata = () => {
  const [isLoading, setIsLoading] = useState(false);
    const [hasAlert, setHasAlert] = useState(false);
    const [alert, setAlert] = useState({
      type: "",
      message: "",
    });
  const [metadata] = useState([
    {
      fullName: "TestObject__c",
      label: "Upserted Object",
      pluralLabel: "Upserted Object",
      nameField: {
        type: "Text",
        label: "Test Object Name",
      },
      fields: [
        {
          fullName: "A_Text_Field__c",
          externalId: "false",
          label: "A Text Field",
          required: "false",
          trackTrending: "false",
          type: "Text",
          unique: "false",
          length: "45",
        },
        {
          fullName: "A_Number_Field__c",
          externalId: "false",
          label: "A Number Field",
          precision: "18",
          required: "true",
          scale: "0",
          trackTrending: "false",
          type: "Number",
          unique: "true",
        },
      ],
      deploymentStatus: "Deployed",
      sharingModel: "ReadWrite",
    },
    {
      fullName: "TestObject2__c",
      label: "Upserted Object 2",
      pluralLabel: "Upserted Object 2",
      nameField: {
        type: "Text",
        label: "Test Object 2 Name",
      },
      deploymentStatus: "Deployed",
      sharingModel: "ReadWrite",
    },
  ]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!metadata) return;
    window.scrollTo(0, 0);
    setIsLoading(true);
    try {
      await axios.post("/metadata/upsert", metadata, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
    
      setIsLoading(false);
      setHasAlert(true);
    
      setAlert({
        type: "success",
        message: "Done!",
      });
    } catch (err) {
      console.error("An error occurred", err);
    
      setIsLoading(false);
      setHasAlert(true);
    
      setAlert({
        type: "error",
        message: err?.response?.data?.message || "An error occurred: " + err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setHasAlert(false);
  };

  return (
    <div>
      {hasAlert && <Alert handleClose={handleClose} alert={alert} />}
      {isLoading && <Loading />}
      <form
        className="slds-form--stacked slds-m-bottom--xx-large"
        onSubmit={handleSubmit}
      >
        <div className="slds-form-element">
          <label
            className="slds-form-element__label slds-text-heading--medium"
            htmlFor="metadata"
          >
            Metadata
          </label>
          <div className="slds-form-element__control">
            <pre>{JSON.stringify(metadata, null, 2)}</pre>
          </div>
        </div>

        <div className="slds-form-element slds-clearfix">
          <div className="slds-float--right">
            <button
              className="slds-button slds-button--brand"
              type="submit"
              disabled={!metadata}
            >
              <svg
                aria-hidden="true"
                className="slds-button__icon--stateful slds-button__icon--left"
              >
                <use xlinkHref="/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
              </svg>
              Execute
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpsertMetadata;
