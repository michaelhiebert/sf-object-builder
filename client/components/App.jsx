import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

// Auth
import { whoami } from "./api/auth.jsx";

// UI components
import NavBar from "./ui/NavBar.jsx";
import Alert from "./ui/Alert.jsx";

// Components
import LoginPanel from "./LoginPanel.jsx";
import UpsertMetadata from "./UpsertMetadata.jsx";
import FileUpload from "./FileUpload.jsx";

const App = () => {
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    whoami()
      .then((data) => {setUser(data)})
      .catch((error) => {
        if (error.response && error.response.status !== 401) {
          console.error("Failed to retrieve logged user.", error);

          setAlert({
            type: "error",
            message:
              "Failed to retrieve logged user. " +
              JSON.stringify(error.response.data),
          });
        }
      });
  }, []);

  return (
    <div>
      <NavBar user={user} setUser={setUser} />
      {!user ? (
        <LoginPanel />
      ) : (
        <div className="slds-m-around--xx-large">
          {alert.message && <Alert alert={alert} />}
          {/* <UpsertMetadata /> */}
          {/* <FileUpload /> */}
          <Routes>
            <Route
              path="/"
              element={
                !user ? <LoginPanel /> : <Navigate to="/upload" replace />
              }
            />
            <Route
              path="/upload"
              element={
                user ? (
                  // <div className="slds-m-around--xx-large">
                    <FileUpload />
                  // </div>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/upsert"
              element={
                user ? (
                  // <div className="slds-m-around--xx-large">
                    <UpsertMetadata />
                  // </div>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      )}
    </div>
  );
};

export default App;
