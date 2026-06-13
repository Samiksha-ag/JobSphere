"""Content-based job recommender.

Uses TF-IDF vectorization and cosine similarity to rank job postings by how
well they match an applicant's profile. This is classic content-based
filtering, not a trained ML model.
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def _job_to_text(job: dict) -> str:
    """Flatten a job posting into a single text document."""
    parts = [
        job.get("title", ""),
        job.get("category", ""),
        job.get("description", ""),
    ]
    return " ".join(p for p in parts if p)


def _profile_to_text(profile: dict) -> str:
    """Flatten an applicant profile into a single text document.

    Combines qualification, experience, and the categories/titles of jobs the
    applicant has already applied to, so recommendations lean toward their
    demonstrated interests.
    """
    parts = [
        profile.get("qualification", ""),
        profile.get("experience", ""),
    ]
    parts.extend(profile.get("appliedCategories", []) or [])
    parts.extend(profile.get("appliedTitles", []) or [])
    parts.extend(profile.get("interests", []) or [])
    return " ".join(p for p in parts if p)


def recommend(profile: dict, jobs: list, top_n: int = 5) -> list:
    """Return up to ``top_n`` jobs ranked by similarity to the profile.

    Each result is ``{"jobId": <id>, "score": <0-100 int>}``.
    """
    if not jobs:
        return []

    job_docs = [_job_to_text(j) for j in jobs]
    profile_doc = _profile_to_text(profile)

    # If we have no profile signal, fall back to returning jobs unscored.
    if not profile_doc.strip():
        return [{"jobId": str(j.get("_id")), "score": 0} for j in jobs[:top_n]]

    corpus = job_docs + [profile_doc]
    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform(corpus)

    profile_vec = matrix[-1]
    job_matrix = matrix[:-1]
    scores = cosine_similarity(profile_vec, job_matrix)[0]

    ranked = sorted(
        zip(jobs, scores), key=lambda pair: pair[1], reverse=True
    )

    results = []
    for job, score in ranked[:top_n]:
        results.append(
            {"jobId": str(job.get("_id")), "score": int(round(float(score) * 100))}
        )
    return results
