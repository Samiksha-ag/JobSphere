const multer = require("multer");
const express = require("express");

const app = express();

// Keep the file in memory so the controller can both parse it (ATS) and
// upload it to S3. Falls back to writing locally only if S3 is unavailable.
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

module.exports = app.use(
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter,
  }).single("resume")
);
