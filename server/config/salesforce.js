import jsforce from "jsforce";

export function createSalesforceConnection(user) {
  if (!user || !user.accessToken || !user.instanceUrl) {
    throw new Error("Invalid Salesforce user session");
  }

  return new jsforce.Connection({
    instanceUrl: user.instanceUrl,
    accessToken: user.accessToken,
  });
}

export async function loginToSalesforce(username, password) {
  const conn = new jsforce.Connection({ loginUrl: process.env.loginUrl });
  await conn.login(username, password);
  return conn;
}
