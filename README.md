# Salesforce Object Builder

**Salesforce Object Builder** is a full-stack React + Express app that lets you define Salesforce Custom Objects and Fields via CSV uploads. It parses your CSV, validates each row, previews the field definitions in the browser, and then creates the Custom Object and Custom Fields in your Salesforce org via the [JSForce](https://github.com/jsforce/jsforce) Metadata API.

## Repository Structure

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
│   │   ├── CsvUploader.jsx             # Component that handles file uploads
│   │   └── LoginPanel.jsx              # Login component
│   │
│   ├── index.css                       # Additional global styles
│   ├── index.jsx                       # Entry point for React app
│   └── vite.config.js                  # Vite config & proxy to Express
│
├── server/
│   ├── __mocks__/                      # Salesforce connection mock files
│   ├── __tests__/                      # Server Test files
│   ├── config/
│   │   └── salesforce.js               # Salesforce connection setup
│   │
│   ├── controllers/
│   │   ├── authController.js           # Handles login, logout, whoami
│   │   ├── csvController.js            # Handles file upload responses
│   │   └── metadataController.js       # Handles Salesforce metadata
│   │
│   ├── middleware/
│   │   └── requireAuth.js              # Authentication middleware
│   │
│   ├── routes/                         # Express Routers
│   │
│   ├── utils/                          # Helper functions
│   │   ├── csvRoutes.js                # CSV parsing utility
│   │ 	└── salesforceFields.js         # Metadata Fields and FLS utility
│   │
│   ├── server.js                       # Server Entry point
│   ├── vite.config.js                  # Config file for serving the dev env and bundling for production
│   └── testServer.js                   # Simplified app for server‐side tests
│
├── public/                             # Static assets copied from SLDS
├── dist/                               # Production build output (client)
├── .env.sample                         # Sample Environment variables
├── .gitignore                          # Specifies intentionally untracked files that Git should ignore
├── README.md                           # Project documentation
├── vite.config.js                      # Config file for serving the dev env and bundling for production
├── nodemon.js                          # Config file to run the server concurrently with vite
└── package.json                        # Root-level dependencies
```

## Prerequisites

- **Node.js** ≥ 16 (v18+ recommended)
- **npm** (or Yarn)
- A Salesforce Developer Org (with API access)
- Your org’s **login URL** and a user with API permissions

## Getting Started

1. **Clone the repo**

```bash
git clone https://github.com/michaelhiebert/sf-object-builder.git
cd sf-object-builder
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

Copy `.env.sample` to `.env` and fill in your values:

```ini
PORT=8080
LOGIN_URL=https://login.salesforce.com          # or test.salesforce.com
SESSION_SECRET_KEY=mySuperSecretKey
IS_HTTPS=false                                  # true if you serve over HTTP
API_VERSION=59.0
```

4. **Run in development**

The app uses concurrently to start both server and client watchers:

```bash
npm run dev
```

This runs:
- Express API on http://localhost:8080
- Vite React app on http://localhost:5173 (with /api proxying to Express)

5. **Run for production**

```bash
npm run build      # builds client into /dist
npm run serve      # serves Express + static /dist at PORT
```

6. **Running tests**

The app uses Jest for tests.

```bash
npm test
```

## Key Dependencies

**Server**
- express
- jsforce
- csv-parse
- multer
- express-session

**Client**
- react
- vite
- axios
- @salesforce-ux/design-system

**Dev**
- nodemon
- concurrently
- jest
- @testing-library

## How It Works

1. Authentication
- Login via `/api/auth/login` stores session with `accessToken` + `instanceUrl`.
- Protected routes use `requireAuth` middleware.

2. CSV Upload & Parsing
- Client `CsvUploader` posts to `/api/upload/csv`.
- `csvController` uses `csv-parse` to validate headers & rows, returns `{ objectName, fields }`.

3. Preview & Create
- Client previews fields in a table.
- “Create Fields” posts to `/api/metadata/create`, which calls JSForce Metadata API to create CustomObject and CustomField entries after that it assigns the FLS permissions to the fields.