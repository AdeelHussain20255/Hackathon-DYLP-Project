import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing in .env file")

engine = create_engine(DATABASE_URL)

ALTER_COMMANDS = [
    "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS gender VARCHAR(20)",
    "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS shift_preference VARCHAR(30)",
    "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS age INTEGER",
    "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS source_platform VARCHAR(50)",
    "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS is_remote BOOLEAN",
    "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS location VARCHAR(200)",
    "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS skills TEXT",
    "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS experience_years INTEGER",
    "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS phone VARCHAR(50)",
]

with engine.connect() as conn:
    for cmd in ALTER_COMMANDS:
        try:
            conn.execute(text(cmd))
            print(f"OK: {cmd}")
        except Exception as e:
            print(f"SKIP: {cmd} -> {e}")
    conn.commit()

print("Migration complete!")
