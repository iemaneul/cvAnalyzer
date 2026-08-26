# cvAnalyzer

Full-stack application that compares a PDF resume with a job description, finds matched and missing skills, calculates a compatibility score, and keeps an analysis history.

## Architecture

`React → Node/Express → Python/FastAPI → Node/Prisma → PostgreSQL`

Node is the public API and owns validation, integration, persistence, and security. Python is an internal, lightweight document-processing service. It extracts PDF text with `pypdf` and uses deterministic rules—no LLM, embeddings, OCR, or external AI.

## Technologies

- React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Axios
- Node.js, Express, Multer, Zod, Prisma, Helmet, CORS, rate limiting
- Python, FastAPI, pypdf, pytest
- PostgreSQL and Docker Compose

## Quick start with Docker

Prerequisite: Docker Desktop.

```bash
docker compose up --build
```

Open http://localhost:5173. APIs are available at Node `http://localhost:3001` and Python `http://localhost:8000`.

## Local development

Start PostgreSQL and create a database named `resume_analyzer`, or run only the database with `docker compose up postgres`.

### Python (terminal 1)

```powershell
cd python-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Node (terminal 2)

```powershell
cd server
Copy-Item .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

### React (terminal 3)

```powershell
cd client
Copy-Item .env.example .env
npm install
npm run dev
```

Open http://localhost:5173.

## API

- `POST /api/analyze` — multipart fields `resume` (PDF, maximum 5 MB) and `jobDescription` (minimum 50 characters)
- `GET /api/analyses` — newest analyses first
- `GET /api/analyses/:id` — complete result
- `DELETE /api/analyses/:id` — remove a result

Success responses use `{ "data": ... }`; errors use `{ "error": { "message": "..." } }`.

## Tests and builds

```powershell
cd python-service
pytest

cd ../server
npm test
npm run build

cd ../client
npm run build
```

Scanned/image-only PDFs are intentionally rejected when no text can be extracted. Uploaded PDFs stay in memory only and are never persisted.
