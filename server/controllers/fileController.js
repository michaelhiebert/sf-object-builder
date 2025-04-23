export function uploadFile(req, res) {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
  
    return res.status(200).send({
      message: "File uploaded successfully",
      filename: req.file.filename,
    });
  }
  