import { createSalesforceConnection } from "../config/salesforce.js";
export async function upsertMetadata(req, res) {

  const conn = createSalesforceConnection(req.user);

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