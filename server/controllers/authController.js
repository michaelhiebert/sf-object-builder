import {
  loginToSalesforce,
  createSalesforceConnection,
} from "../config/salesforce.js";
import { getSession } from "../middleware/sessionCheck.js";

export async function login(req, res) {
  const { username, password } = req.body;

  try {
    const conn = await loginToSalesforce(username, password);
    const identity = await conn.identity();

    req.session.user = {
      username,
      orgId: identity.organization_id,
      name: identity.display_name,
      accessToken: conn.accessToken,
      instanceUrl: conn.instanceUrl,
    };

    return res.redirect("/index.html");
  } catch (error) {
    console.error("Login error:", error);
    return res.status(401).json(error);
  }
}

export async function logout(req, res) {
  const session = getSession(req, res);
  if (!session) return;

  const conn = createSalesforceConnection(session);
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
  const user = getSession(req, res);
  if (!user) return;

  try {
    const conn = createSalesforceConnection(user);
    const identity = await conn.identity();

    return res.json(identity);
  } catch (error) {
    console.error("Error fetching identity:", error);
    return res.status(500).json({ error: "Failed to fetch identity" });
  }
}
