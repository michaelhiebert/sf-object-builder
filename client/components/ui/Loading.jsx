import React from "react";

const Loading = () => {
  return (
    <div className="spinner">
      <div className="slds-spinner_container">
        <div
          role="status"
          className="slds-spinner slds-spinner_medium slds-spinner_brand"
        >
          <span className="slds-assistive-text">Loading</span>
          <div className="slds-spinner__dot-a"></div>
          <div className="slds-spinner__dot-b"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
