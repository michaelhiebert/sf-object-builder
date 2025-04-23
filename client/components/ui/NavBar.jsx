import React from "react";
import { useNavigate } from "react-router-dom";

// Auth
import { logout } from "../api/auth.jsx";

const NavBar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null); 
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };  

  return (
    <div className="slds-page-header" role="banner">
      <div className="slds-grid">
        {/* Banner */}
        <div className="slds-col slds-has-flexi-truncate">
          <div className="slds-media slds-media--center slds-no-space slds-grow">
            <div className="slds-media__figure">
              <svg
                aria-hidden="true"
                className="slds-icon slds-icon-text-default"
              >
                <use xlinkHref="/assets/icons/utility-sprite/svg/symbols.svg#salesforce1"></use>
              </svg>
            </div>
            <div className="slds-media__body">
              <p
                className="slds-page-header__title slds-truncate slds-align-middle"
                title="Salesforce Object Builder"
              >
                Salesforce Object Builder
              </p>
              <p className="slds-text-body--small page-header__info">
                Convert your CSVs into Salesforce Objects
              </p>
            </div>
          </div>
        </div>

        {/* Logged user name */}
        {user && (
          <div className="slds-col--padded slds-no-flex slds-grid slds-align-middle">
            Hi {user.display_name}
          </div>
        )}

        {/* Logout button */}
        {user && (
          <div className="slds-col slds-no-flex slds-grid">
            <button
              onClick={handleLogout}
              className="slds-button slds-button--neutral"
            >
              <svg
                aria-hidden="true"
                className="slds-button__icon--stateful slds-button__icon--left"
              >
                <use xlinkHref="/assets/icons/utility-sprite/svg/symbols.svg#logout"></use>
              </svg>
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
