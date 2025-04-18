import React from "react";

import NavBar from "./ui/NavBar.js";
import LoginPanel from "./LoginPanel.js";
import UpsertMetadata from "./UpsertMetadata.js";
import Alert from "./ui/Alert.js";
import Loading from "./ui/Loading.js";

export default class App extends React.Component {
  state = {
    user: null,
    metadata: null,
    isLoading: false,
    hasAlert: false,
  };

  alert = {
    type: "",
    message: "",
  };

  componentDidMount() {
    // Get logged in user
    fetch("/auth/whoami", {
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (response.ok) {
        response.json().then((json) => {
          this.setState({ user: json });
        });
      } else if (response.status !== 401) {
        // Ignore 'unauthorized' responses before logging in
        console.error(
          "Failed to retrieve logged user.",
          JSON.stringify(response)
        );

        this.alert = {
          type: "error",
          message: "Failed to retrieve logged user." + JSON.stringify(response),
        };
      }
    });
  }

  handleExecute = async (data) => {
    this.setState({ isLoading: true });

    this.alert = {
      type: "info",
      message: "Processing",
    };

    try {
      const response = await fetch("/metadata/upsert", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data.metadata),
      });

      if (response.ok) {
        this.setState({
          isLoading: false,
          hasAlert: true,
        });

        this.alert = {
          type: "success",
          message: "Done!",
        };

        return;
      }

      this.setState({
        isLoading: false,
        hasAlert: true,
      });

      this.alert = {
        type: "error",
        message: response.statusText,
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
      <div>
        <NavBar user={this.state.user} />
        {this.state.user == null ? (
          <LoginPanel />
        ) : (
          <div className="slds-m-around--xx-large">
            {this.state.hasAlert ? <Alert alert={this.alert} /> : null}
            {this.state.isLoading && <Loading />}
            <UpsertMetadata onExecute={this.handleExecute} />
          </div>
        )}
      </div>
    );
  }
}
