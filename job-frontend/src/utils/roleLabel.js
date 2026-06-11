// Maps internal DB role values to user-facing labels.
// DB stores legacy role strings; the UI presents friendlier terms.
const ROLE_LABELS = {
  Admin: "Admin",
  "Job Provider": "Recruiter",
  User: "Applicant",
};

export const roleLabel = (role) => ROLE_LABELS[role] || role;

export default roleLabel;
