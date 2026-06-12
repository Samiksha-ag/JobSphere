const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const pdfParse = require("pdf-parse");

const Job = require("../models/job");
const Applicant = require("../models/applicant");
const s3 = require("../util/s3");
const { computeAtsScore } = require("../util/ats");

exports.getAvailableJobs = (req, res, next) => {
  let appliedJobs = [];
  Applicant.find({ userId: req.userId })
    .lean()
    .then((applicants) => {
      applicants.forEach((applicant) => appliedJobs.push(applicant.jobId));
      const today = new Date();
      return Job.find({
        _id: { $not: { $in: appliedJobs } },
      }).lean();
    })
    .then((jobs) => {
      res.status(200).json({
        message: "Fetched the list of jobs",
        jobs: jobs,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.getAppliedJobs = (req, res, next) => {
  let appliedJobs = [];
  const statusMap = new Map();
  Applicant.find({ userId: req.userId })
    .lean()
    .then((applicants) => {
      applicants.forEach((applicant) => {
        appliedJobs.push(applicant.jobId);
        statusMap.set(applicant.jobId.toString(), applicant.status);
      });
      return Job.find({ _id: { $in: appliedJobs } }).lean();
    })
    .then((jobsApplied) => {
      jobsApplied.forEach((applied) => {
        applied.status = statusMap.get(applied._id.toString());
      });
      res.status(200).json({
        message: "Fetched the list of jobs",
        jobsApplied: jobsApplied,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.applyJob = async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error("Resume not Found");
      err.statusCode = 422;
      throw err;
    }

    const jobId = req.params.jobId;
    const userId = req.userId;
    const providerId = req.body.providerId;

    // Block duplicate applications before storing anything.
    const existing = await Applicant.findOne({ jobId, userId });
    if (existing) {
      return res
        .status(409)
        .json({ message: "You have already applied for the job!" });
    }

    const job = await Job.findById(jobId).lean();
    if (!job) {
      const err = new Error("Job not found");
      err.statusCode = 404;
      throw err;
    }

    // ATS keyword match between the resume text and the job posting.
    let atsScore = 0;
    try {
      const parsed = await pdfParse(req.file.buffer);
      atsScore = computeAtsScore(parsed.text, job).score;
    } catch (parseErr) {
      console.log("Resume parse failed, ATS score defaulted to 0:", parseErr.message);
    }

    // Store the resume in S3 when configured, otherwise on local disk.
    let resume;
    let storageType;
    if (s3.isConfigured()) {
      const key = `resumes/${uuid()}_${userId}.pdf`;
      await s3.uploadToS3(key, req.file.buffer, req.file.mimetype);
      resume = key;
      storageType = "s3";
    } else {
      const fileName = `${uuid()}_${userId}.pdf`;
      const dir = path.join(__dirname, "..", "resumes");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, fileName), req.file.buffer);
      resume = `resumes/${fileName}`;
      storageType = "local";
    }

    await new Applicant({
      jobId,
      userId,
      resume,
      storageType,
      atsScore,
      status: "Applied",
      providerId,
    }).save();

    res.status(201).json({
      message: "Successfully applied for the job!",
      atsScore,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};