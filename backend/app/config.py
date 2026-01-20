"""
Application configuration using Pydantic Settings.

Environment variables are loaded from .env file or system environment.
All settings can be overridden via environment variables.
"""

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
    cors_origins: list[str] = ["http://localhost:3000"]

    # API configuration
    api_title: str = "MealFrame API"
    api_description: str = "Meal planning API that eliminates decision fatigue"
    api_version: str = "0.1.0"

    # Server configuration
    debug: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


# Global settings instance
settings = Settings()
