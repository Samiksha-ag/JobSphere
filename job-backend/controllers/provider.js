const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

const Job = require("../models/job");
const Applicant = require("../models/applicant");
const User = require("../models/user");

const { removeResume } = require("../util/helper");
const s3 = require("../util/s3");

exports.getStats = (req, res, next) => {
  let jobsCount = 0;
  let applicantsCount = 0;
  Job.find({ providerId: req.userId })
    .countDocuments()
    .then((jobs) => {
      jobsCount = jobs;
      return Applicant.find({ providerId: req.userId }).countDocuments();
    })
    .then((applicants) => {
      applicantsCount = applicants;
      return res.status(200).json({
        message: "Successfully fetched the stats",
        stats: { jobsCount, applicantsCount },
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.getRecents = (req, res, next) => {
  Job.find({ providerId: req.userId })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean()
    .then((jobs) => {
      return res.status(200).json({
        message: "Successfully fetched the recent jobs",
        recentJobs: jobs,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.getJobs = (req, res, next) => {
  Job.find({ providerId: req.userId })
    .lean()
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

exports.addJob = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const newJob = new Job({
    ...req.body,
    providerId: req.userId,
  });

  let jobId;
  newJob
    .save()
    .then((job) => {
      jobId = job._id;
      return User.findById(req.userId);
    })
    .then((user) => {
      user.jobsPosted.push(jobId);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: "Job Added Successfully" });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.getJob = (req, res, next) => {
  const jobId = req.params.jobId;

  Job.findOne({ _id: jobId, providerId: req.userId })
    .lean()
    .then((job) => {
      if (!job) {
        const error = new Error("Job not found");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Fetched the job Successfully", job: job });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.editJob = (req, res, next) => {
  const jobId = req.params.jobId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  Job.findOneAndUpdate(
    { _id: jobId, providerId: req.userId },
    req.body,
    { new: true }
  )
    .then((data) => {
      if (!data) {
        res.status(404).json({
          message: `Cannot update job with id=${jobId}. Maybe job was not found!`,
        });
      } else {
        res.status(200).json({ message: "Job was updated successfully." });
      }
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.deleteJob = (req, res, next) => {
  const jobId = req.params.jobId;
  let resumes = [];
  let applicants = [];

  Job.findOneAndDelete({ _id: jobId, providerId: req.userId })
    .then((data) => {
      if (!data) {
        const error = new Error("Cannot delete job. Job not found!");
        error.statusCode = 404;
        throw error;
      }
      return User.findOneAndUpdate(
        { _id: req.userId },
        { $pull: { jobsPosted: jobId } }
      );
    })
    .then((result) => {
      return Applicant.find({ jobId: jobId, providerId: req.userId }).then(
        (docs) => {
          docs.forEach((doc) => {
            resumes.push({ resume: doc.resume, storageType: doc.storageType });
            applicants.push(doc._id);
          });
        }
      );
    })
    .then((result) => {
      return Applicant.deleteMany({ _id: { $in: applicants } });
    })
    .then((result) => {
      resumes.forEach((r) => removeResume(r.resume, r.storageType));
      res.json({ message: "Job record was deleted successfully!" });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.getApplicantsForJob = (req, res, next) => {
  const jobId = req.params.jobId;
  const providerId = req.userId;

  Applicant.find({
    providerId: providerId,
    jobId: jobId,
    status: { $regex: "Applied", $options: "i" },
  })
    .populate("userId", "name _id")
    .lean()
    .then((applicants) => {
      if (!applicants) {
        return res.status(200).json({ message: "Looks like no one has applied yet!" });
      }
      return res.status(200).json({
        message: "Successfully fetched the applicants",
        applicants: applicants,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.getShortlistsForJob = (req, res, next) => {
  const jobId = req.params.jobId;
  const providerId = req.userId;

  Applicant.find({
    providerId: providerId,
    jobId: jobId,
    status: { $regex: "Shortlisted", $options: "i" },
  })
    .populate("userId", "name email")
    .lean()
    .then((applicants) => {
      if (!applicants) {
        return res.status(200).json({ message: "Looks like no one has been shortlisted yet!" });
      }
      return res.status(200).json({
        message: "Successfully fetched the applicants",
        shortlists: applicants,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.getApplicantResume = async (req, res, next) => {
  try {
    const applicantId = req.params.applicantItemId;
    const applicant = await Applicant.findOne({
      _id: applicantId,
      providerId: req.userId,
    }).lean();
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    res.setHeader("Content-Type", "application/pdf");

    if (applicant.storageType === "s3") {
      const stream = await s3.getObjectStream(applicant.resume);
      stream.on("error", (err) => next(err));
      return stream.pipe(res);
    }

    // Local fallback. Older records may store the path with or without the
    // project-root prefix, so resolve relative to the backend directory.
    const resumePath = path.join(__dirname, "..", applicant.resume);
    fs.createReadStream(resumePath)
      .on("error", () => res.status(404).json({ message: "Resume file not found" }))
      .pipe(res);
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.shortlistApplicant = (req, res, next) => {
  const applicantItemId = req.params.applicantItemId;
  Applicant.findById({ _id: applicantItemId })
    .then((applicant) => {
      if (!applicant) {
        return res.status(401).json({ message: "Applicant not found" });
      }
      if (applicant.providerId.toString() !== req.userId.toString()) {
        const error = new Error("You are unauthorized to do the action!");
        error.statusCode = 401;
        throw error;
      }
      if (applicant.status === "Shortlisted") {
        return res.status(409).json({ message: "Already shortlisted!" });
      }
      applicant.status = "Shortlisted";
      return applicant.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Shortlisted the candidate!" });
    })
    .catch((err) => {
      next(err);
    });
};

exports.rejectApplicant = (req, res, next) => {
  const applicantItemId = req.params.applicantItemId;

  Applicant.findById(applicantItemId)
    .then((applicant) => {
      if (!applicant) {
        return res.status(404).json({ message: "Applicant not found!" });
      }
      if (req.userId.toString() !== applicant.providerId.toString()) {
        const error = new Error("You are unauthorized to do the action!");
        error.statusCode = 401;
        throw error;
      }
      removeResume(applicant.resume, applicant.storageType);
      return Applicant.findByIdAndDelete(applicantItemId);
    })
    .then((result) => {
      return res.status(200).json({ message: "Applicant rejected successfully!" });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};