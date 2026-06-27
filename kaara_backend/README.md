# Kaara Saaram API — கார சாரம் உணவகம்

FastAPI backend for the Kaara Saaram Chettinad restaurant web application.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | FastAPI 0.111 |
| ORM | SQLAlchemy 2.0 |
| Database | MySQL 8.4 LTS |
| Driver | PyMySQL |
| Validation | Pydantic v2 |
| Migrations | Alembic |
| Auth | JWT (python-jose) + Passlib bcrypt |
| Server | Uvicorn |

---

## Setup

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL with your MySQL password

# 4. Create MySQL database
mysql -u root -p
CREATE DATABASE kaara_saaram_db;
EXIT;

# 5. Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Endpoints

| Method | URL | Description |
|---|---|---|
| GET | `/` | App health check |
| GET | `/health/db` | Database connection check |
| GET | `/docs` | Swagger UI (dev only) |

---

## Project Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI app, CORS, router registration
│   ├── database.py       # SQLAlchemy engine, session, Base
│   ├── config.py         # Pydantic settings from .env
│   ├── models/           # SQLAlchemy table models
│   ├── schemas/          # Pydantic request/response schemas
│   ├── routes/           # APIRouter URL definitions
│   ├── controllers/      # Request handler functions
│   ├── services/         # Business logic layer
│   ├── middleware/       # CORS, auth middleware
│   ├── utils/            # Helpers: hashing, tokens, etc.
│   └── core/             # Logging, shared dependencies
├── uploads/              # User-uploaded images
├── alembic/              # Database migrations
├── requirements.txt
├── .env.example
└── README.md
```
