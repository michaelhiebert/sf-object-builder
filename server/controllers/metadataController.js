import { createSalesforceConnection } from "../config/salesforce.js";
import { getSession } from "../middleware/sessionCheck.js";

export async function upsertMetadata(req, res) {
  const session = getSession(req, res);
  if (!session) return;

  const conn = createSalesforceConnection(session);

  try {
    const results = await conn.metadata.upsert("CustomObject", req.body);
    const errors = results
      .filter(r => !r.success)
      .map(r => JSON.stringify(r.errors));

    if (errors.length) {
      return res.status(400).send(errors);
    }

    return res.send(results);
  } catch (error) {
    return res.status(500).json(error);
  }
}