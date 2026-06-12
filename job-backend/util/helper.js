const path = require("path");
const fs = require("fs");
const s3 = require("./s3");

exports.clearResume = (filePath) => {
  const absPath = path.join(__dirname, "..", filePath);
  fs.unlink(absPath, (err) => {
    if (err) console.log(err);
  });
};

// Deletes a resume from wherever it lives (S3 or local disk).
exports.removeResume = (resume, storageType) => {
  if (!resume) return;
  if (storageType === "s3") {
    s3.deleteFromS3(resume).catch((err) =>
      console.log("Failed to delete S3 object:", err.message)
    );
  } else {
    exports.clearResume(resume);
  }
};

exports.dateFormatter = (givenDate) => {
  let date;
  if (givenDate) {
    date = new Date(givenDate);
  } else {
    date = new Date();
  }
  return date.toLocaleString("en-gb", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};
