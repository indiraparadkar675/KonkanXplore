# KokanXplore manual setup

This project uses the existing React/Vite frontend and Python/LangGraph workflow. Saved itineraries use a local SQLite file; there is no separate database server to install. The existing agents use local Python logic rather than a hosted generative model, so no API key is needed for trip generation. RAG depends on the supplied FAISS index and a Hugging Face embedding model.

## A. Required for local execution

### 1. Python environment and backend dependencies

Open PowerShell in the project root (`C:\Users\pravi\OneDrive\Desktop\KonkanXplore`). Python 3.10 or newer is required. The repository already contains a `venv` directory on the development machine; to create a clean environment on another machine run:

```powershell
py -3.10 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If PowerShell blocks activation, use the interpreter directly instead:

```powershell
py -3.10 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Verify imports:

```powershell
.\.venv\Scripts\python.exe -c "import fastapi, langgraph, langchain_community, langchain_huggingface, faiss; print('Backend imports OK')"
```

### 2. Frontend

Install Node.js (a current LTS release) from [nodejs.org](https://nodejs.org/), then open PowerShell in `frontend`:

```powershell
npm ci
npm run dev
```

Vite serves the existing React site at `http://localhost:5173`. Its dev server forwards `/api` requests to `http://127.0.0.1:8000`.

### 3. Start the API

Open a second PowerShell window in the project root. To configure backend overrides, create `.env` from the example and edit that file:

```powershell
Copy-Item .env.example .env
notepad .env
```

The defaults work locally, so `.env` is optional. Start the API:

```powershell
.\.venv\Scripts\python.exe -m uvicorn api:api --reload --host 127.0.0.1 --port 8000
```

Verify it in another PowerShell window:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
```

The response should report `status: online`. Interactive API documentation is at `http://127.0.0.1:8000/docs`.

## B. Required for database connectivity

No database installation or account is needed. Python's built-in SQLite module creates `data/kokanxplore.db` and the `trips` table automatically when the API starts. Existing JSON files remain the source data for tourism activities and locations.

To use a different writable database file, open the project root `.env` file and set, for example:

```dotenv
DATABASE_PATH=data/kokanxplore.db
```

Restart the API after changing it. Verify database setup by starting the API, requesting `http://127.0.0.1:8000/api/trips` (initially `[]`), saving a generated trip in the website, and requesting `/api/trips` again. Restart the API and request `/api/trips` once more to confirm persistence. No users or accounts are required; this is a local saved-trip store, not user-authenticated storage.

## C. Required for AI/RAG functionality

The existing workflow uses five local Python agents and the JSON datasets. It does not currently call a hosted LLM and requires no API key. For retrieval and vector indexing, the existing files `vectorstore/index.faiss` and `vectorstore/index.pkl` are used. The embedding model is `sentence-transformers/all-MiniLM-L6-v2`.

On first RAG use, the embedding package may download that model from Hugging Face. An internet connection and enough disk space are needed for this initial download. No credential is normally required for this public model. To rebuild the index from the existing JSON datasets (this overwrites the current FAISS index, so back up `vectorstore` first), run from the project root:

```powershell
.\.venv\Scripts\python.exe -m rag.ingest
```

Verify retrieval with:

```powershell
.\.venv\Scripts\python.exe -m rag.retriever
```

The current `/api/plan` workflow uses the existing agents and activity dataset; RAG retrieval is not currently invoked by that route. The weather/routing modules are local helpers and are not wired to live third-party services. No live weather or routing data is promised.

## D. Required for online deployment

1. Deploy the Python API on a Python 3.10+ host and install `requirements.txt` during build. Set the start command to `python -m uvicorn api:api --host 0.0.0.0 --port $PORT` (adapt `$PORT` to the platform's syntax).
2. Provide a persistent writable disk for SQLite. Set `DATABASE_PATH` to a file on that disk, for example `/var/lib/kokanxplore/kokanxplore.db`; ensure the service account can create the parent directory and write the file. Ephemeral server filesystems lose saved trips on restart/redeploy.
3. Set `CORS_ORIGINS` to the exact deployed frontend origin(s), comma-separated, such as `https://your-site.example`. Do not use `*` with credentialed requests.
4. Build and deploy `frontend` with `npm ci && npm run build`. For local build configuration, copy `frontend/.env.example` to `frontend/.env.local` and set `VITE_API_BASE_URL=https://api.example.com`; for hosted builds, set the same variable in the frontend host's build environment. Leave it blank for local Vite proxying. Without it, the frontend uses relative `/api` URLs and needs a host/proxy that routes those requests to the API.
5. If enabling a hosted AI or external weather/maps provider in future, add its secret only as a server-side deployment environment variable. Do not put secret keys in `VITE_*` variables or commit them. No such credentials are required by the current code.

Verify deployment by checking `/api/health`, opening the deployed frontend, generating a trip, saving it, and confirming it appears after an API restart. The deployment provider, persistent volume, domain, and TLS setup are chosen by the project owner; no provider has been configured in this repository.
