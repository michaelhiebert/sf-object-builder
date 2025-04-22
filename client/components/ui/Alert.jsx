import React from "react";

const Alert = ({ alert, handleClose }) => {
  const typeToClassName = {
    info: "slds-notify slds-notify_alert slds-theme_alert-texture slds-theme_info",
    warning:
      "slds-notify slds-notify_alert slds-theme_alert-texture slds-theme_warning",
    error:
      "slds-notify slds-notify_alert slds-theme_alert-texture slds-theme_error",
    success:
      "slds-notify slds-notify_alert slds-theme_alert-texture slds-theme_success",
  };

  const typeToIcon = {
    info: "/assets/icons/utility-sprite/svg/symbols.svg#sync",
    warning: "/assets/icons/utility-sprite/svg/symbols.svg#warning",
    error: "/assets/icons/utility-sprite/svg/symbols.svg#error",
    success: "/assets/icons/utility-sprite/svg/symbols.svg#success",
  };

  return (
    <div className={typeToClassName[alert.type]} role="alert">
      <span className="slds-assistive-text">{alert.type}</span>
      <span className="slds-icon_container slds-icon-utility-error slds-m-right_x-small">
        <svg className="slds-icon slds-icon_x-small" aria-hidden="true">
          <use xlinkHref={typeToIcon[alert.type]}></use>
        </svg>
      </span>
      <h2>{alert.message}</h2>
      <div className="slds-notify__close">
        <button
          className="slds-button slds-button_icon slds-button_icon-small slds-button_icon-inverse"
          title="Close"
          onClick={handleClose}
        >
          <svg className="slds-button__icon" aria-hidden="true">
            <use xlinkHref="/assets/icons/utility-sprite/svg/symbols.svg#close"></use>
          </svg>
          <span className="slds-assistive-text">Close</span>
        </button>
      </div>
    </div>
  );
};

export default Alert;
