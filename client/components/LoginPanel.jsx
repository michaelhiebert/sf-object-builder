import React, { useState, useCallback } from "react";
import axios from "axios";

// UI
import Loading from "./ui/Loading.jsx";
import Alert from "./ui/Alert.jsx";

const LoginPanel = () => {
  const [formState, setFormState] = useState({
    username: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);
  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const handleClose = useCallback(() => {
    setHasAlert(false);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { username, password } = formState;

    if (!username || !password) {
      setAlert({
        type: "warning",
        message: "Enter your Username and Password",
      });
      setHasAlert(true);
      return;
    }

    try {
      setIsLoading(true);
      setAlert({ type: "info", message: "Logging in..." });
      setHasAlert(true);

      const response = await axios.post("/auth/login", { username, password });

      setAlert({ type: "success", message: "Logged in" });
      setHasAlert(true);

      // Redirect after successful login
      window.location = "/index.html";
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Incorrect Username and/or Password",
      });
      setHasAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // <div className="slds-modal slds-fade-in-open">
      <div className="slds-modal__container">
        <div className="slds-box slds-theme--shade">
          <p className="slds-text-heading--medium slds-m-bottom--medium">
            Log in to your Salesforce Account:
          </p>

          {hasAlert && <Alert handleClose={handleClose} alert={alert} />}

          <form className="slds-form" onSubmit={handleSubmit}>
            <div className="slds-form-element__row">
              <label className="slds-form-element__label" htmlFor="username">
                <abbr className="slds-required" title="required">
                  *{" "}
                </abbr>
                Username
              </label>
              <div className="slds-form-element__control">
                <input
                  type="text"
                  id="username"
                  placeholder="Username"
                  className="slds-input"
                  name="username"
                  value={formState.username}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="slds-form-element__row">
              <label className="slds-form-element__label" htmlFor="password">
                <abbr className="slds-required" title="required">
                  *{" "}
                </abbr>
                Password
              </label>
              <div className="slds-form-element__control">
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  className="slds-input"
                  name="password"
                  value={formState.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="slds-form-element__row">
              <button
                type="submit"
                className="slds-button slds-button--brand slds-m-top_x-small"
              >
                <svg
                  aria-hidden="true"
                  className="slds-button__icon--stateful slds-button__icon--left"
                >
                  <use xlinkHref="/assets/icons/utility-sprite/svg/symbols.svg#salesforce1"></use>
                </svg>
                Log in
              </button>

              {isLoading && <Loading />}
            </div>
          </form>
        </div>
      </div>
    // </div>
  );
};

export default LoginPanel;
