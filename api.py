import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from app import graph as workflow
from agents.activity_agent import find_activities
from agents.budget_agent import calculate_budget
from agents.profile_agent import create_profile


graph = workflow.compile() if hasattr(workflow, "compile") else workflow
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", str(BASE_DIR / "data" / "kokanxplore.db")))


def connect_db():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("""CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        request_json TEXT NOT NULL,
        result_json TEXT NOT NULL
    )""")
    return connection


def initialize_database():
    with connect_db() as connection:
        connection.execute("SELECT 1")


api = FastAPI(title="KonkanXplore API", description="AI-powered tourism planning API", version="1.0.0", on_startup=[initialize_database])
origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if origin.strip()]
api.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["GET", "POST"], allow_headers=["Content-Type"])


class TripRequest(BaseModel):
    budget: float = Field(gt=0, le=100000000)
    destination: str = Field(default="", max_length=100)
    duration_days: int = Field(ge=1, le=60)
    group_size: int = Field(ge=1, le=100)
    traveler_type: str = Field(min_length=1, max_length=40)
    interests: list[str] | str
    walking_level: str = "low"


class BudgetRequest(BaseModel):
    total_budget: float = Field(ge=0)
    accommodation_cost: float = Field(ge=0)
    food_cost: float = Field(ge=0)
    activity_cost: float = Field(ge=0)
    transport_cost: float = Field(ge=0)


class ActivityRequest(BaseModel):
    interests: list[str] | str
    traveler_type: str = "solo"
    budget: float = Field(gt=0)


@api.get("/")
@api.get("/api/health")
def home():
    return {"status": "online", "project": "KonkanXplore", "database": "sqlite", "message": "AI Tourism Planning API is running"}


@api.post("/api/plan")
def plan_trip(request: TripRequest):
    interests = request.interests
    if isinstance(interests, str):
        interests = [item.strip().lower() for item in interests.split(",") if item.strip()]
    else:
        interests = [item.strip().lower() for item in interests if item.strip()]
    if not interests:
        raise HTTPException(status_code=422, detail="Provide at least one travel interest.")
    state = {
        "budget": int(request.budget), "destination": request.destination.strip(),
        "duration_days": request.duration_days,
        "group_size": request.group_size, "traveler_type": request.traveler_type.strip().lower(),
        "interests": interests, "walking_level": request.walking_level.strip().lower(),
        "profile": {}, "activities": [], "planned_activities": [],
        "budget_result": {}, "critic_result": {}, "revision_count": 0,
    }
    try:
        result = graph.invoke(state)
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Trip planning failed: {error}") from error
    return {
        "success": True, "profile": result.get("profile", {}),
        "activities": result.get("activities", []),
        "planned_activities": result.get("planned_activities", []),
        "budget_result": result.get("budget_result", {}),
        "critic_result": result.get("critic_result", {}),
        "revision_count": result.get("revision_count", 0),
    }


@api.post("/api/profile")
def traveler_profile(request: TripRequest):
    interests = request.interests
    if isinstance(interests, str):
        interests = [item.strip().lower() for item in interests.split(",") if item.strip()]
    return create_profile(int(request.budget), request.duration_days, request.group_size,
                          request.traveler_type.strip().lower(), interests,
                          request.walking_level.strip().lower())


@api.post("/api/activities")
def recommend_activities(request: ActivityRequest):
    try:
        return {"activities": find_activities(request.interests, request.traveler_type, request.budget)}
    except (OSError, ValueError) as error:
        raise HTTPException(status_code=500, detail="Could not read the local activity dataset.") from error


@api.post("/api/budget")
def budget_summary(request: BudgetRequest):
    return calculate_budget(request.total_budget, request.accommodation_cost,
                            request.food_cost, request.activity_cost, request.transport_cost)


@api.post("/api/trips", status_code=201)
def save_trip(payload: dict):
    request_data = payload.get("request")
    result_data = payload.get("result")
    if not isinstance(request_data, dict) or not isinstance(result_data, dict):
        raise HTTPException(status_code=422, detail="Both request and result objects are required.")
    trip_id = str(uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    try:
        with connect_db() as connection:
            connection.execute("INSERT INTO trips VALUES (?, ?, ?, ?)", (trip_id, created_at, json.dumps(request_data), json.dumps(result_data)))
    except sqlite3.Error as error:
        raise HTTPException(status_code=500, detail="Could not save the trip.") from error
    return {"id": trip_id, "created_at": created_at}


@api.get("/api/trips")
def list_trips():
    with connect_db() as connection:
        rows = connection.execute("SELECT id, created_at, request_json, result_json FROM trips ORDER BY created_at DESC").fetchall()
    return [{"id": row["id"], "created_at": row["created_at"], "request": json.loads(row["request_json"]), "result": json.loads(row["result_json"])} for row in rows]


@api.get("/api/trips/{trip_id}")
def get_trip(trip_id: str):
    with connect_db() as connection:
        row = connection.execute("SELECT id, created_at, request_json, result_json FROM trips WHERE id = ?", (trip_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Saved trip not found.")
    return {"id": row["id"], "created_at": row["created_at"], "request": json.loads(row["request_json"]), "result": json.loads(row["result_json"])}


@api.get("/api/itinerary/{trip_id}")
def get_itinerary(trip_id: str):
    trip = get_trip(trip_id)
    return {"id": trip["id"], "created_at": trip["created_at"], "planned_activities": trip["result"].get("planned_activities", []), "budget_result": trip["result"].get("budget_result", {}), "critic_result": trip["result"].get("critic_result", {})}
