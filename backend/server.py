
from fastapi import FastAPI, APIRouter, Request, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

from fields import get_field_metadata
from generator import generate_data
from formatter import format_as_json, format_as_csv
from rate_limit import rate_limiter

# ------------------------------------------------------------------
# Environment
# ------------------------------------------------------------------

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

# ------------------------------------------------------------------
# App setup
# ------------------------------------------------------------------

app = FastAPI(
    title="DummyGen API",
    description="API for generating dummy / fake data for testing",
    version="1.0.0",
)

api_router = APIRouter(prefix="/api")

# ------------------------------------------------------------------
# CORS
# ------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------
# Models
# ------------------------------------------------------------------

class GenerateRequest(BaseModel):
    schema: Dict[str, Any] = Field(..., description="Field definitions")
    count: int = Field(10, ge=1, le=1000, description="Number of records")
    format: str = Field("json", description="json or csv")
    seed: Optional[int] = Field(None, description="Deterministic seed")

class GenerateResponse(BaseModel):
    data: List[Dict[str, Any]]
    count: int
    format: str

# ------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "dummygen-api",
    }

@api_router.get("/fields")
async def get_fields():
    return get_field_metadata()

@api_router.post("/generate", response_model=GenerateResponse)
async def generate(request: Request, body: GenerateRequest):
    """
    Generate dummy data based on schema.
    Rate limited per IP.
    """
    rate_limiter.check_rate_limit(request)

    if body.format not in {"json", "csv"}:
        raise HTTPException(
            status_code=400,
            detail="Format must be 'json' or 'csv'",
        )

    try:
        data = generate_data(body.schema, body.count, body.seed)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Generation error: {str(e)}",
        )

    if body.format == "csv":
        csv_content = format_as_csv(data)
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=dummygen.csv"
            },
        )

    return {
        "data": data,
        "count": len(data),
        "format": "json",
    }

# ------------------------------------------------------------------
# Router
# ------------------------------------------------------------------

app.include_router(api_router)

# ------------------------------------------------------------------
# Logging
# ------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("dummygen")

# ------------------------------------------------------------------
# Lifecycle
# ------------------------------------------------------------------

@app.on_event("startup")
async def startup_event():
    logger.info("DummyGen API started")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("DummyGen API stopped")
