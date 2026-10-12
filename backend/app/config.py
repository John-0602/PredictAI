import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

DATASET_PATH = os.getenv("DATASET_PATH", str(PROJECT_ROOT / "ai4i2020.csv"))
MODELS_DIR = BASE_DIR / "models"
DB_PATH = BASE_DIR / "predictai.db"

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]
