import React from "react";

import Loading from "./ui/Loading";
import Alert from "./ui/Alert";

export default class LoginPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      isLoading: false,
      hasAlert: false,
    };

    this.alert = {
      type: "",
      message: "",
    };
  }

  handleInputChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleSubmit = async (event) => {
    this.setState({ isLoading: true });
    event.preventDefault();
    const { username, password } = this.state;

    const data = {
      username,
      password,
    };

    if (data.username === "" || data.password === "") {
      this.setState({
        isLoading: false,
        hasAlert: true,
      });

      this.alert = {
        type: "warning",
        message: "Enter your Username and Password",
      };

      return;
    }

    try {
      this.setState({
        isLoading: true,
        hasAlert: true,
      });

      this.alert = {
        type: "info",
        message: "Login in...",
      };

      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        this.setState({
          isLoading: false,
          hasAlert: true,
        });

        this.alert = {
          type: "success",
          message: "Logged in",
        };

        window.location = "/index.html";

        return;
      }

      this.setState({
        isLoading: false,
        hasAlert: true,
      });

      this.alert = {
        type: "error",
        message: "Incorrect Username and/or Password",
      };
    } catch (err) {
      console.log("An error occured", err);
      this.setState({
        isLoading: false,
        hasAlert: true,
      });

      this.alert = {
        type: "error",
        message: "An error ocurred: " + err,
      };
    } finally {
      this.setState({
        isLoading: false,
      });
    }
  };

  render() {
    return (
      <div className="slds-modal slds-fade-in-open">
        <div className="slds-modal__container">
          <div className="slds-box slds-theme--shade">
            <p className="slds-text-heading--medium slds-m-bottom--medium">
              Log in to your Salesforce Account:
            </p>

            {this.state.hasAlert ? <Alert alert={this.alert} /> : null}

            <form className="slds-form" onSubmit={this.handleSubmit}>
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
                    required=""
                    className="slds-input"
                    name="username"
                    onChange={this.handleInputChange}
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
                    placeholder="password"
                    required=""
                    className="slds-input"
                    name="password"
                    onChange={this.handleInputChange}
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

                {this.state.isLoading && <Loading />}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
