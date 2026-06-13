"""JobSphere recommendation microservice (FastAPI).

Exposes a content-based job recommendation endpoint consumed by the Node
backend. Stateless: the backend sends the candidate jobs and the applicant
profile with each request.
"""

from typing import List, Optional

from fastapi import FastAPI
from pydantic import BaseModel

from recommender import recommend

app = FastAPI(title="JobSphere AI", version="1.0.0")


class Job(BaseModel):
    _id: str
    title: str = ""
    category: str = ""
    description: str = ""

    class Config:
        extra = "allow"


class Profile(BaseModel):
    qualification: str = ""
    experience: str = ""
    appliedCategories: List[str] = []
    appliedTitles: List[str] = []
    interests: List[str] = []


class RecommendRequest(BaseModel):
    profile: Profile
    jobs: List[dict]
    topN: Optional[int] = 5


@app.get("/health")
def health():
    return {"status": "ok", "service": "jobsphere-ai"}


@app.post("/recommend")
def recommend_jobs(req: RecommendRequest):
    results = recommend(req.profile.dict(), req.jobs, req.topN or 5)
    return {"recommendations": results}
