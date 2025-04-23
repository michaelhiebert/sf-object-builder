import jsforce from "jsforce";

export function createSalesforceConnection(auth) {
  return new jsforce.Connection({
    instanceUrl: auth.instanceUrl,
    accessToken: auth.accessToken,
    version: process.env.apiVersion,
  });
}

export async function loginToSalesforce(username, password) {
  const conn = new jsforce.Connection({ loginUrl: process.env.loginUrl });
  await conn.login(username, password);
  return conn;
}
