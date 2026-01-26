"""
API routes for day template endpoints.

Provides a list endpoint for the TemplatePicker in the Week View.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends

from ..database import get_db
from ..models.day_template import DayTemplate, DayTemplateSlot
from ..models.meal_type import MealType
from ..schemas.day_template import DayTemplateListItem

router = APIRouter(prefix="/api/v1/day-templates", tags=["Day Templates"])


@router.get("", response_model=list[DayTemplateListItem])
async def list_day_templates(
    db: AsyncSession = Depends(get_db),
) -> list[DayTemplateListItem]:
    """
    List all day templates with slot counts and previews.

    Returns templates ordered by name, each with:
    - slot_count: Number of meal slots
    - slot_preview: Arrow-separated meal type names (e.g., "Breakfast → Lunch → Dinner")
    """
    result = await db.execute(
        select(DayTemplate).order_by(DayTemplate.name)
    )
    templates = result.scalars().all()

    items = []
    for template in templates:
        # Get meal type names ordered by slot position
        mt_result = await db.execute(
            select(MealType.name)
            .join(DayTemplateSlot, DayTemplateSlot.meal_type_id == MealType.id)
            .where(DayTemplateSlot.day_template_id == template.id)
            .order_by(DayTemplateSlot.position)
        )
        meal_type_names = [row[0] for row in mt_result.all()]

        items.append(
            DayTemplateListItem(
                id=template.id,
                name=template.name,
                notes=template.notes,
                slot_count=len(meal_type_names),
                slot_preview=" → ".join(meal_type_names) if meal_type_names else None,
            )
        )

    return items
