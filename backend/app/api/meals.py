"""
API routes for meal endpoints.

Provides CSV import functionality for bulk meal creation.
Per frozen spec: MEAL_IMPORT_GUIDE.md
"""
import logging

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..schemas.meal import MealImportResult
from ..services.meals import import_meals_from_csv

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/meals", tags=["Meals"])


@router.post("/import", response_model=MealImportResult)
async def import_meals(
    file: UploadFile = File(..., description="CSV file to import"),
    db: AsyncSession = Depends(get_db),
) -> MealImportResult:
    """
    Import meals from a CSV file.

    Accepts multipart/form-data with a CSV file. Per MEAL_IMPORT_GUIDE.md:
    - Required columns: name, portion_description
    - Optional columns: calories_kcal, protein_g, carbs_g, fat_g, meal_types, notes
    - Rows with errors are skipped, others are imported
    - Unknown meal types generate warnings but don't block meal creation
    """
    # Validate file type
    if file.content_type and file.content_type not in (
        "text/csv",
        "text/plain",
        "application/vnd.ms-excel",
        "application/octet-stream",
    ):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Expected CSV file.",
        )

    # Read file content
    try:
        raw_bytes = await file.read()
        csv_content = raw_bytes.decode("utf-8-sig")  # Handle BOM from Excel
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="File encoding error. Please save the file as UTF-8.",
        )

    if not csv_content.strip():
        raise HTTPException(
            status_code=400,
            detail="CSV file is empty.",
        )

    result = await import_meals_from_csv(db, csv_content)
    return result
