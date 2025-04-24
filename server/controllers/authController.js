import {
  loginToSalesforce,
  createSalesforceConnection,
} from "../config/salesforce.js";

export async function login(req, res) {
  const { username, password } = req.body;

  try {
    const conn = await loginToSalesforce(username, password);
    const identity = await conn.identity();

    const user = {
      username,
      orgId: identity.organization_id,
      name: identity.display_name,
      accessToken: conn.accessToken,
      instanceUrl: conn.instanceUrl,
    };

    req.session.user = user; // stored in session for future requests
    req.user = user; // optionally set for this request

    return res.status(200).json({ message: "Logged in", user });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(401).json({
      message: "Invalid Salesforce credentials",
      error: error.message || error,
    });
  }
}

export async function logout(req, res) {
  const user = req.user || req.session?.user;
  if (!user) return res.status(401).json({ message: "No user session" });

  const conn = createSalesforceConnection(user);
  try {
    await conn.logout();
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).send("Failed to destroy session");
      }
      return res.sendStatus(200);
    });
  } catch (error) {
    console.error("Salesforce logout error:", error);
    return res.status(500).json({ message: "Salesforce logout failed", error });
  }
}

export async function whoami(req, res) {
  try {
    const conn = createSalesforceConnection(req.user);
    const identity = await conn.identity();

    return res.json(identity);
  } catch (error) {
    console.error("Error fetching identity:", error);
    return res.status(500).json({ error: "Failed to fetch identity" });
  }
}
