# KokanXplore

KokanXplore is a Konkan coast trip planner built on the existing React/Vite site and Python/LangGraph agents. It uses local tourism JSON data, FastAPI, and SQLite persistence for saved itineraries. FAISS retrieval is preserved but is not currently called by trip generation.

## Features

- Existing animated, responsive React landing page and trip preference form.
- LangGraph flow connecting profile, activity, planner, budget, and critic agents.
- Trip generation and supporting profile, activity, and budget API endpoints.
- Accurate reporting of estimated fixed costs and activity costs; if the fixed estimate already exceeds a budget, the critic reports the overrun rather than claiming it fits.
- Save and retrieve itineraries in local SQLite.
- Existing tourism JSON datasets and FAISS vector index are retained.

## Stack and layout

| Area | Existing implementation |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Framer Motion, Axios |
| API/workflow | FastAPI, Pydantic, LangGraph |
| Data | JSON files under `data/`; SQLite saved trips |
| Retrieval | LangChain, Hugging Face sentence embeddings, FAISS (separate from current planning route) |

```text
agents/       Existing profile, activity, planner, budget, critic agents
data/         Local Konkan tourism JSON data and generated SQLite file
frontend/     Existing React/Vite application
models/       Reserved LLM module (currently empty; trip generation uses local agents)
rag/          FAISS ingestion and retrieval modules
tools/        Budget, routing, and weather helpers
vectorstore/  Existing FAISS index files
api.py        FastAPI routes and SQLite saved-trip persistence
app.py        Existing LangGraph workflow and CLI entry point
MANUAL_SETUP.md  Local, database, AI/RAG, and deployment instructions
```

## Run locally

See [MANUAL_SETUP.md](MANUAL_SETUP.md) for exact PowerShell commands. In short, install Python dependencies from `requirements.txt`, run `npm ci` in `frontend`, start the API with `python -m uvicorn api:api --reload --port 8000`, and start the site with `npm run dev` in `frontend`.

The API initializes `data/kokanxplore.db` and its `trips` table on startup. The current agents use local Python logic and no hosted generative AI API, so no API key is needed for trip generation. The first use of the Hugging Face embedding model may require internet access.

## API

FastAPI interactive docs: `http://127.0.0.1:8000/docs`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/plan` | Run the LangGraph trip workflow |
| POST | `/api/profile` | Create a traveler profile |
| POST | `/api/activities` | Recommend from local activity JSON |
| POST | `/api/budget` | Calculate a supplied expense breakdown |
| POST | `/api/trips` | Persist a generated request/result pair |
| GET | `/api/trips` | List saved trips |
| GET | `/api/trips/{id}` | Fetch one saved trip |
| GET | `/api/itinerary/{id}` | Fetch its itinerary and review summary |

## Database and deployment

SQLite is the current database and requires no installation. Set `DATABASE_PATH` to a persistent writable disk path when deploying. Set `CORS_ORIGINS` to the deployed frontend origin. If frontend and backend use separate domains, set `VITE_API_BASE_URL` during the frontend build. Copy `.env.example` to `.env` for local backend overrides; keep `.env` out of version control.

The current store saves trips without user accounts. It does not yet provide user authentication or separate relational user, destination, activity, itinerary, and expense tables. See setup notes for current limits and persistence verification.

## Screenshots

Add screenshots of the existing landing page and a generated itinerary here before publishing.

## Future scope

- Add user accounts and per-user trip ownership if needed.
- Connect the existing RAG retrieval to trip generation after grounding and response behavior are validated.
- Add verified live service integrations only when credentials and data providers are selected.
- Move SQLite to PostgreSQL for multi-instance deployments.

## Contributors

Add contributor names and links before submission.
