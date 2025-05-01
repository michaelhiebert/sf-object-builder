# Salesforce Object Builder

This app creates an object from a CSV

## Folder Structure

```
sf-object-builder/
├── client/                             # React frontend
│   ├── components/                     # Reusable components
│   │   ├── ui/                         # UI components
│   │   │   ├── Alert.jsx               # Component for alerts like warnings, errors and success messages
│   │   │   ├── Loading.jsx             # Component for loading screens
│   │   │   └── NavBar.jsx              # Component for Navigation
│   │   │
│   │   ├── App.jsx                     # Main application component
│   │   ├── FileUpload.jsx              # Component that handles file uploads
│   │   ├── LoginPanel.jsx              # Login component
│   │   └── UpsertMetadata.jsx          # Component to test a hardcoded upsert using Metadata API
│   │
│   └── index.jsx                       # Entry point for React app
│
├── server/
│   ├── config/
│   │   ├── salesforce.js               # Handles Salesforce connection & login logic
│   │   └── session.js                  # Express session config (if needed separately)
│   │
│   ├── controllers/
│   │   ├── authController.js           # Handles login, logout, whoami
│   │   ├── fileController.js           # Handles file upload responses
│   │   └── metadataController.js       # Handles metadata upsert
│   │
│   ├── middleware/
│   │   └──sessionCheck.js              # Middleware to validate session
│   │
│   ├── routes/
│   │   ├── authRoutes.js               # Routes for auth endpoints
│   │   ├── fileRoutes.js               # Routes for file upload
│   │   └── metadataRoutes.js           # Routes for Salesforce metadata
│   │
│   ├── utils/
│   │ 	└── csvParser.js                # CSV parsing utility
│   │
│   ├── uploads/                        # Directory for storing uploaded CSVs
│   │   └── (your .csv files)           # Ignored in .gitignore
│   │
│   └── server.js                       # Entry point
│
├── public/                             # Static assets (e.g., images, fonts)
├── dist/                               # Distribution folder for production
├── .env                                # Environment variables
├── .gitignore                          # Specifies intentionally untracked files that Git should ignore
├── README.md                           # Project documentation
├── vite.config.js                      # Config file for serving the dev env and bundling for production
├── nodemon.js                          # Config file to run the server concurrently with vite
└── package.json                        # Root-level dependencies
```
