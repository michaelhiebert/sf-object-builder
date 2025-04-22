import React, { useState } from "react";
import axios from "axios";

// UI components
import Alert from "./ui/Alert.jsx";
import Loading from "./ui/Loading.jsx";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setAlert({ type: "error", message: "Please select a file." });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsLoading(true);
    setAlert({ type: "info", message: "Uploading file..." });

    try {
      const response = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setAlert({ type: "success", message: response.data?.message || "Upload successful!" });
    } catch (error) {
      console.error("Upload error:", error);
      setAlert({
        type: "error",
        message: error?.response?.data?.message || "Error uploading file.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert(null);
  };

  return (
    <div>
      {alert && <Alert alert={alert} handleClose={handleCloseAlert} />}
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={isLoading}>
        Upload
      </button>
      {isLoading && <Loading />}
    </div>
  );
};

export default FileUpload;

// import React from "react";

// export default class FileUpload extends React.Component {
//   // function FileUpload() {
//   // const [selectedFile, setSelectedFile] = useState(null);

//   // const handleFileChange = (event) => {
//   //     setSelectedFile(event.target.files[0]);
//   // };

//   // const handleUpload = async () => {
//   //     if (!selectedFile) {
//   //         alert('Please select a file.');
//   //         return;
//   //     }

//   //     const formData = new FormData();
//   //     formData.append('file', selectedFile);

//   //     try {
//   //         const response = await axios.post('/upload', formData, {
//   //             headers: {
//   //                 'Content-Type': 'multipart/form-data'
//   //             }
//   //         });
//   //         alert(response.data.message);
//   //     } catch (error) {
//   //         console.error('Error uploading file:', error);
//   //         alert('Error uploading file.');
//   //     }
//   // };
//   constructor(props) {
//     super(props);

//     this.handleClose = this.handleClose.bind(this);

//     this.state = {
//       hasAlert: false,
//       selectedFile: null,
//     };
//   }

//   handleClose() {
//     this.setState({ hasAlert: false });
//   }

//   handleFileChange = (event) => {
//     this.setState({ selectedFile: event.target.files[0] });
//   };

//   handleUpload = async (data) => {
//     this.setState({ isLoading: true });

//     this.alert = {
//       type: "info",
//       message: "Processing",
//     };

//     // console.log("data",data);
//     console.log("this.state.selectedFile",this.state.selectedFile);
//     const formData = new FormData();
//     formData.append('file', this.state.selectedFile);
//     try {
//       const response = await fetch("/upload", {
//         method: "POST",
//         // headers: {
//         // //   Accept: "application/json",
//         //   "Content-Type": "multipart/form-data",
//         // },
//         // body: this.state.selectedFile,
//         body: formData,
//         // body: JSON.stringify(data.metadata),
//       });

//       const res = await response.json();

//       if (response.ok) {
//         this.setState({
//           isLoading: false,
//           hasAlert: true,
//         });

//         this.alert = {
//           type: "success",
//           message: "Done!",
//         };

//         return;
//       }

//       let errors = "";
//       for (let i = 0; i < res.length; i++) {
//         errors += res[i];
//       }

//       this.setState({
//         isLoading: false,
//         hasAlert: true,
//       });

//       this.alert = {
//         type: "error",
//         message: res.length + " error(s) found:" + errors,
//       };
//     } catch (err) {
//       console.log("An error occured", err);
//       this.setState({
//         isLoading: false,
//         hasAlert: true,
//       });

//       this.alert = {
//         type: "error",
//         message: "An error ocurred: " + err,
//       };
//     } finally {
//       this.setState({
//         isLoading: false,
//       });
//     }
//   };

//   render() {
//     return (
//       <div>
//         <input type="file" onChange={this.handleFileChange} />
//         <button onClick={this.handleUpload}>Upload</button>
//       </div>
//     );
//   }
// }
