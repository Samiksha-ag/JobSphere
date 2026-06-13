const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const pdfParse = require("pdf-parse");

const Job = require("../models/job");
const Applicant = require("../models/applicant");
const User = require("../models/user");
const s3 = require("../util/s3");
const { computeAtsScore } = require("../util/ats");
const { sendMail, templates } = require("../util/email");

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

exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).lean();

    // What the applicant has already applied to (signals their interests).
    const applied = await Applicant.find({ userId })
      .populate("jobId", "title category")
      .lean();
    const appliedJobIds = applied
      .map((a) => a.jobId && a.jobId._id)
      .filter(Boolean);
    const appliedCategories = [
      ...new Set(
        applied.map((a) => a.jobId && a.jobId.category).filter(Boolean)
      ),
    ];
    const appliedTitles = applied
      .map((a) => a.jobId && a.jobId.title)
      .filter(Boolean);

    // Only recommend jobs they haven't applied to yet.
    const candidateJobs = await Job.find({
      _id: { $nin: appliedJobIds },
    }).lean();
    if (candidateJobs.length === 0) {
      return res.status(200).json({ recommendations: [] });
    }

    const profile = {
      qualification: user ? user.qualification : "",
      experience: user ? user.experience : "",
      appliedCategories,
      appliedTitles,
      interests: [],
    };

    // Ask the Python recommendation service to rank the candidate jobs.
    const aiUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    let ranked = [];
    try {
      const resp = await fetch(`${aiUrl}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, jobs: candidateJobs, topN: 5 }),
      });
      if (resp.ok) {
        const data = await resp.json();
        ranked = data.recommendations || [];
      }
    } catch (e) {
      // AI service down — degrade gracefully, no recommendations.
      console.log("AI service unavailable:", e.message);
    }

    const jobMap = new Map(candidateJobs.map((j) => [j._id.toString(), j]));
    const recommendations = ranked
      .map((r) => {
        const job = jobMap.get(r.jobId);
        return job ? { ...job, matchScore: r.score } : null;
      })
      .filter(Boolean);

    res.status(200).json({ recommendations });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
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

    // Notify the applicant their application was received (non-blocking).
    const applicant = await User.findById(userId).lean();
    if (applicant) {
      const mail = templates.applicationReceived(applicant.name, job.title);
      sendMail({ to: applicant.email, ...mail });
    }

    res.status(201).json({
      message: "Successfully applied for the job!",
      atsScore,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};