"""
Application configuration using Pydantic Settings.

Environment variables are loaded from .env file or system environment.
All settings can be overridden via environment variables.
"""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings with environment variable support.

    Environment variables should be prefixed with the setting name in uppercase.
    Example: DATABASE_URL, CORS_ORIGINS
    """

    # Database configuration
    database_url: str = "postgresql+asyncpg://mealframe:password@localhost:5432/mealframe"

    # CORS configuration
    # Can be a comma-separated string or a list
    cors_origins: list[str] | str = ["http://localhost:3000"]

    # API configuration
    api_title: str = "MealFrame API"
    api_description: str = "Meal planning API that eliminates decision fatigue"
    api_version: str = "0.1.0"

    # Server configuration
    debug: bool = False

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from comma-separated string or list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


# Global settings instance
settings = Settings()
