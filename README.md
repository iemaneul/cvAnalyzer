# cvAnalyzer

Full-stack application that compares a PDF resume with a job description, finds matched and missing skills, calculates a compatibility score, and keeps an analysis history.

The analyzer classifies job skills as required, standard, or nice-to-have. The compatibility score is weighted accordingly (3, 2, and 1), and the result includes short resume excerpts as evidence for detected skills. Explicitly negated requirements such as “Docker is not required” are ignored.

Evidence is also classified by resume section. Mentions in professional experience and projects are stronger than isolated mentions in a skills or courses list. When a nearby phrase states years of experience, that context is displayed with the evidence. Evidence quality remains separate from requirement coverage so the primary score stays understandable.

When the job description explicitly requests a duration such as “3+ years of React,” the app compares it with an explicitly documented duration near that skill in the resume. Missing duration is reported as unknown—not as zero years—and experience alignment remains separate from the match score.

The analyzer also compares supported education levels, language proficiency, and common cloud/project-management certifications. Qualification alignment is displayed independently from technical matching, and an unstated language level is marked unknown rather than failed.

Each new analysis includes a prioritized action plan. High-priority actions cover required skills and qualification gaps, medium-priority actions improve weak evidence or missing duration, and low-priority actions cover nice-to-have requirements. Checklist progress is stored locally in the browser, and every recommendation explicitly avoids encouraging unsupported claims.

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

### Accuracy evaluation

The repository includes a small, versioned bilingual evaluation dataset. Run it whenever aliases, skills, negation rules, or priority detection change:

```powershell
cd python-service
python -m app.evaluation
```

The command reports skill extraction precision, recall, F1, requirement-priority accuracy, and failing cases. Add anonymized real-world examples to `evaluation/dataset.json` over time; never commit personal resume data.

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

The score measures textual alignment with detected requirements; it is not a prediction of hiring decisions. Suggestions never recommend claiming experience the candidate does not genuinely have.
