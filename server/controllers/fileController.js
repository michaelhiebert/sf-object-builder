import fs from "fs/promises";
import { csvParser } from "../utils/csvParser.js";

export async function parseCsvFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const csvBuffer = await fs.readFile(filePath);
    const csvString = csvBuffer.toString();

    const parsedFields = await csvParser(csvString);

    res.json({ fields: parsedFields });
  } catch (error) {
    console.error("Error parsing CSV:", error);
    res.status(500).json({ error: error.message });
  }
}
