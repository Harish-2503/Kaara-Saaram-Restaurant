"""
Database initialisation script.
Run once to create all tables:
    python init_db.py
"""
import sys
from app.database import engine, check_db_connection
from app.models import Base  # noqa — imports all models so Base.metadata is populated

def main():
    print("Checking database connection...")
    if not check_db_connection():
        print("ERROR: Cannot connect to database. Check DATABASE_URL in .env")
        sys.exit(1)

    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Done. All tables created successfully.")

if __name__ == "__main__":
    main()
