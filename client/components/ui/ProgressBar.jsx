import React from "react";

export const ProgressBar = () => (
  <div className="slds-progress-bar slds-progress-bar_circular slds-m-around--xx-large" role="progressbar">
    <span className="slds-progress-bar__value" style={{ width: "100%" }}>
      <span className="slds-assistive-text">Uploading...</span>
    </span>
  </div>
);
