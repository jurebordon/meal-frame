"""
Service layer for meal import operations.

Handles CSV parsing, validation, and bulk meal creation with meal-type associations.
Per frozen spec: MEAL_IMPORT_GUIDE.md
"""
import csv
import io
import logging
from decimal import Decimal, InvalidOperation

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.meal import Meal
from app.models.meal_type import MealType
from app.models.meal_to_meal_type import meal_to_meal_type
from app.schemas.meal import (
    MealImportError,
    MealImportResult,
    MealImportSummary,
    MealImportWarning,
)

logger = logging.getLogger(__name__)

# Expected CSV columns per MEAL_IMPORT_GUIDE.md
REQUIRED_COLUMNS = {"name", "portion_description"}
OPTIONAL_COLUMNS = {"calories_kcal", "protein_g", "carbs_g", "fat_g", "meal_types", "notes"}
ALL_COLUMNS = REQUIRED_COLUMNS | OPTIONAL_COLUMNS


async def _resolve_meal_types(
    db: AsyncSession,
) -> dict[str, MealType]:
    """Build a lookup dict of meal type name -> MealType object (case-sensitive)."""
    result = await db.execute(select(MealType))
    meal_types = result.scalars().all()
    return {mt.name: mt for mt in meal_types}


def _parse_optional_int(value: str, field_name: str) -> tuple[int | None, str | None]:
    """Parse an optional integer field. Returns (value, warning_message)."""
    if not value or not value.strip():
        return None, None
    try:
        return int(value.strip()), None
    except (ValueError, TypeError):
        return None, f"Invalid {field_name} value '{value}', imported with null value"


def _parse_optional_decimal(value: str, field_name: str) -> tuple[Decimal | None, str | None]:
    """Parse an optional decimal field. Returns (value, warning_message)."""
    if not value or not value.strip():
        return None, None
    try:
        return Decimal(value.strip()), None
    except (InvalidOperation, ValueError, TypeError):
        return None, f"Invalid {field_name} value '{value}', imported with null value"


async def import_meals_from_csv(
    db: AsyncSession,
    csv_content: str,
) -> MealImportResult:
    """
    Import meals from CSV content.

    Per MEAL_IMPORT_GUIDE.md:
    - Rows with errors (missing required fields) are skipped, others are imported
    - Duplicate names are allowed (creates new meal)
    - Unknown meal types are logged as warnings, meal is still created
    - Missing optional fields result in null values

    Args:
        db: Database session
        csv_content: Raw CSV string content (UTF-8)

    Returns:
        MealImportResult with summary, warnings, and errors
    """
    warnings: list[MealImportWarning] = []
    errors: list[MealImportError] = []
    created_count = 0

    # Resolve all meal types upfront
    meal_type_lookup = await _resolve_meal_types(db)

    # Parse CSV
    try:
        reader = csv.DictReader(io.StringIO(csv_content))
    except Exception as e:
        return MealImportResult(
            success=False,
            summary=MealImportSummary(total_rows=0, created=0, skipped=0, warnings=0),
            errors=[MealImportError(row=0, message=f"Failed to parse CSV: {e}")],
        )

    # Validate header
    if reader.fieldnames is None:
        return MealImportResult(
            success=False,
            summary=MealImportSummary(total_rows=0, created=0, skipped=0, warnings=0),
            errors=[MealImportError(row=0, message="CSV file is empty or has no header row")],
        )

    # Check required columns exist
    header_set = {f.strip() for f in reader.fieldnames if f}
    missing_required = REQUIRED_COLUMNS - header_set
    if missing_required:
        return MealImportResult(
            success=False,
            summary=MealImportSummary(total_rows=0, created=0, skipped=0, warnings=0),
            errors=[MealImportError(
                row=0,
                message=f"Missing required columns: {', '.join(sorted(missing_required))}",
            )],
        )

    rows = list(reader)
    total_rows = len(rows)

    # Filter out completely empty rows (trailing blank rows)
    rows = [row for row in rows if any(v.strip() for v in row.values() if v)]

    for row_idx, row in enumerate(rows):
        row_num = row_idx + 1  # 1-based row number (excluding header)

        # Strip whitespace from all values
        row = {k.strip(): (v.strip() if v else "") for k, v in row.items() if k}

        # Validate required fields
        name = row.get("name", "").strip()
        portion_description = row.get("portion_description", "").strip()

        if not name:
            errors.append(MealImportError(
                row=row_num,
                message="Missing required field: name",
            ))
            continue

        if not portion_description:
            errors.append(MealImportError(
                row=row_num,
                message="Missing required field: portion_description",
            ))
            continue

        # Parse optional numeric fields
        row_warnings: list[str] = []

        calories_kcal, cal_warn = _parse_optional_int(row.get("calories_kcal", ""), "calories_kcal")
        if cal_warn:
            row_warnings.append(cal_warn)

        protein_g, pro_warn = _parse_optional_decimal(row.get("protein_g", ""), "protein_g")
        if pro_warn:
            row_warnings.append(pro_warn)

        carbs_g, carb_warn = _parse_optional_decimal(row.get("carbs_g", ""), "carbs_g")
        if carb_warn:
            row_warnings.append(carb_warn)

        fat_g, fat_warn = _parse_optional_decimal(row.get("fat_g", ""), "fat_g")
        if fat_warn:
            row_warnings.append(fat_warn)

        notes = row.get("notes", "").strip() or None

        # Create meal
        meal = Meal(
            name=name,
            portion_description=portion_description,
            calories_kcal=calories_kcal,
            protein_g=protein_g,
            carbs_g=carbs_g,
            fat_g=fat_g,
            notes=notes,
        )
        db.add(meal)
        await db.flush()  # Get the meal ID

        # Handle meal type associations
        meal_types_str = row.get("meal_types", "").strip()
        if meal_types_str:
            type_names = [t.strip() for t in meal_types_str.split(",") if t.strip()]
            for type_name in type_names:
                mt = meal_type_lookup.get(type_name)
                if mt is None:
                    row_warnings.append(
                        f"Meal type '{type_name}' not found, skipping assignment"
                    )
                else:
                    await db.execute(
                        meal_to_meal_type.insert().values(
                            meal_id=meal.id,
                            meal_type_id=mt.id,
                        )
                    )
            await db.flush()

        # Add any warnings from this row
        for warn_msg in row_warnings:
            warnings.append(MealImportWarning(row=row_num, message=warn_msg))

        created_count += 1

    # Update total_rows to reflect non-empty rows
    total_rows = len(rows)

    return MealImportResult(
        success=True,
        summary=MealImportSummary(
            total_rows=total_rows,
            created=created_count,
            skipped=total_rows - created_count,
            warnings=len(warnings),
        ),
        warnings=warnings,
        errors=errors,
    )
