import React, { useState, useEffect } from "react";
import axios from "axios";

// UI components
import NavBar from "./ui/NavBar.jsx";
import Alert from "./ui/Alert.jsx";

// Components
import LoginPanel from "./LoginPanel.jsx";
// import UpsertMetadata from "./UpsertMetadata.jsx";
import FileUpload from "./FileUpload.jsx";

const App = () => {
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await axios.get("/auth/whoami", {
          withCredentials: true,
        });
        setUser(response.data); // response.data *is* the parsed JSON
      } catch (error) {
        if (error.response && error.response.status !== 401) {
          console.error("Failed to retrieve logged user.", error);

          setAlert({
            type: "error",
            message:
              "Failed to retrieve logged user. " +
              JSON.stringify(error.response.data),
          });
        }
      }
    };

    checkUser();
  }, []);

  return (
    <div>
      <NavBar user={user} />
      {!user ? (
        <LoginPanel />
      ) : (
        <div className="slds-m-around--xx-large">
          {alert.message && <Alert alert={alert} />}
          {/* <UpsertMetadata /> */}
          <FileUpload />
        </div>
      )}
    </div>
  );
};

export default App;
