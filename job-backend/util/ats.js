// Lightweight ATS-style keyword matcher.
// It is NOT machine learning: it extracts meaningful keywords from the job
// posting and measures how many appear in the resume text, returning a
// percentage match plus the matched and missing keywords.

const STOPWORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "any", "can", "had",
  "her", "was", "one", "our", "out", "day", "get", "has", "him", "his", "how",
  "man", "new", "now", "old", "see", "two", "way", "who", "boy", "did", "its",
  "let", "put", "say", "she", "too", "use", "with", "will", "this", "that",
  "from", "they", "have", "your", "job", "role", "work", "team", "looking",
  "must", "should", "able", "good", "strong", "experience", "years", "year",
  "required", "requirement", "requirements", "responsibilities", "candidate",
  "candidates", "ideal", "plus", "etc", "including", "knowledge", "skills",
  "skill", "ability", "we", "a", "an", "to", "of", "in", "on", "as", "is",
  "or", "be", "at", "by", "it", "no", "do", "if", "so", "up",
]);

const tokenize = (text) =>
  (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    // Keep internal dots (e.g. node.js) but drop leading/trailing ones.
    .map((w) => w.replace(/^\.+|\.+$/g, ""))
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));

// Build the set of keywords the job is looking for.
const extractJobKeywords = (job) => {
  const text = [job.title, job.category, job.description].join(" ");
  return Array.from(new Set(tokenize(text)));
};

// Compare resume text against the job's keywords.
const computeAtsScore = (resumeText, job) => {
  const keywords = extractJobKeywords(job);
  if (keywords.length === 0) {
    return { score: 0, matched: [], missing: [] };
  }
  const resumeWords = new Set(tokenize(resumeText));
  const matched = keywords.filter((k) => resumeWords.has(k));
  const missing = keywords.filter((k) => !resumeWords.has(k));
  const score = Math.round((matched.length / keywords.length) * 100);
  return { score, matched, missing };
};

module.exports = { computeAtsScore, extractJobKeywords };
