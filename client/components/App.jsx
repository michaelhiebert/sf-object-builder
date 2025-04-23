import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth
import { whoami } from "./api/auth.jsx";

// UI components
import NavBar from "./ui/NavBar.jsx";
import Alert from "./ui/Alert.jsx";
import Loading from "./ui/Loading.jsx";

// Components
import LoginPanel from "./LoginPanel.jsx";
import UpsertMetadata from "./UpsertMetadata.jsx";
import FileUpload from "./FileUpload.jsx";

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    whoami()
      .then((data) => {
        setUser(data);
        setIsLoading(false);
      })
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
        setIsLoading(false);
      });
  }, []);

  return (
    <div>
      <NavBar user={user} setUser={setUser} />
      {isLoading && <Loading />}
      {!user ? (
        <Routes>
          <Route path="*" element={<LoginPanel setUser={setUser} />} />
        </Routes>
      ) : (
        <div className="slds-m-around--xx-large">
          {alert.message && <Alert alert={alert} />}
          <Routes>
            <Route path="/" element={<Navigate to="/upload" />} />
            <Route path="/upload" element={<FileUpload />} />
            <Route path="/upsert" element={<UpsertMetadata />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      )}
    </div>
  );
};

export default App;
