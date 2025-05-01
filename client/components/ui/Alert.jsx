import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const ALERT_TIMEOUT_MS = 5000;

const Alert = ({
  alert,
  handleClose,
  autoDismiss = true,
  dismissAfter = ALERT_TIMEOUT_MS,
}) => {
  const [visible, setVisible] = useState(true);

  const typeToClassName = {
    info: "slds-theme_info",
    warning: "slds-theme_warning",
    error: "slds-theme_error",
    success: "slds-theme_success",
  };

  const typeToIcon = {
    info: "sync",
    warning: "warning",
    error: "error",
    success: "success",
  };

  const iconName = typeToIcon[alert.type] || "info";
  const themeClass = typeToClassName[alert.type] || "slds-theme_info";

  // whenever a new alert comes in, make sure it's visible
  useEffect(() => {
    setVisible(true);
  }, [alert]);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => setVisible(false), dismissAfter);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissAfter]);

  const closeAlert = () => {
    setVisible(false);
    setTimeout(handleClose, 300); // let animation finish
  };

  if (!visible) return null;

  return (
    <div
      className={`slds-notify slds-notify_alert slds-theme_alert-texture ${themeClass} slds-m-around--medium fade-in`}
      role="alert"
      style={{ transition: "opacity 0.3s ease", opacity: visible ? 1 : 0 }}
    >
      <span className="slds-assistive-text">{alert.type || "info"}</span>
      <span
        className="slds-icon_container slds-m-right_x-small"
        title={alert.type}
      >
        <svg className="slds-icon slds-icon_x-small" aria-hidden="true">
          <use
            xlinkHref={`/assets/icons/utility-sprite/svg/symbols.svg#${iconName}`}
          />
        </svg>
      </span>
      <h2 className="slds-truncate" title={alert.message}>
        {alert.message}
      </h2>
      <div className="slds-notify__close">
        <button
          className="slds-button slds-button_icon slds-button_icon-small slds-button_icon-inverse"
          title="Close"
          onClick={closeAlert}
        >
          <svg className="slds-button__icon" aria-hidden="true">
            <use xlinkHref="/assets/icons/utility-sprite/svg/symbols.svg#close" />
          </svg>
          <span className="slds-assistive-text">Close</span>
        </button>
      </div>
    </div>
  );
};

Alert.propTypes = {
  alert: PropTypes.shape({
    type: PropTypes.oneOf(["info", "warning", "error", "success"]),
    message: PropTypes.string.isRequired,
  }).isRequired,
  handleClose: PropTypes.func.isRequired,
  autoDismiss: PropTypes.bool,
  dismissAfter: PropTypes.number,
};

export default Alert;
