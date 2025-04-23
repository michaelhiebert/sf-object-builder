import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// Auth
import { logout } from "../api/auth.jsx";

// UI
import Loading from "./Loading.jsx";

const NavBar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      setUser(null); 
      setIsLoading(false);
      
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };  

  return (
    <div className="slds-page-header" role="banner">
      {isLoading && <Loading />}
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

         {/* Navigation links */}
         {user && (
          <div className="slds-grid slds-align-middle slds-m-right_medium">
            <Link to="/upload" className="slds-m-right_small">
              Upload
            </Link>
            <Link to="/upsert" className="slds-m-right_small">
              Upsert
            </Link>
          </div>
        )}

        {/* User info and logout */}
        {user && (
          <div className="slds-col--padded slds-no-flex slds-grid slds-align-middle">
            <span className="slds-col--padded slds-no-flex slds-grid slds-align-middle">Hi {user.display_name}</span>
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
