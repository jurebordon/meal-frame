"""AppConfig model - single-row application configuration."""
from datetime import datetime

from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..database import Base


class AppConfig(Base):
    """
    Single-row application configuration.

    Stores global settings like timezone, week start day, and default week plan.
    The CHECK constraint ensures only one row can exist (id must be 1).
    """
    __tablename__ = "app_config"
    __table_args__ = (
        CheckConstraint("id = 1", name="ck_app_config_singleton"),
    )

    id = Column(Integer, primary_key=True, default=1)
    timezone = Column(Text, default="UTC", nullable=False)
    week_start_day = Column(Integer, default=0, nullable=False)  # 0=Monday
    default_week_plan_id = Column(UUID(as_uuid=True), ForeignKey("week_plan.id"))
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    default_week_plan = relationship("WeekPlan", foreign_keys=[default_week_plan_id])

    def __repr__(self):
        return f"<AppConfig(timezone='{self.timezone}', week_start_day={self.week_start_day})>"
