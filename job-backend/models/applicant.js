const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const applicantSchema = new Schema({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  resume: {
    type: String,
    required: true,
  },
  storageType: {
    type: String,
    enum: ["s3", "local"],
    default: "local",
  },
  atsScore: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    required: true,
  },
  providerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Applicant", applicantSchema);
