"""
Database connection and session management for async SQLAlchemy.

This module provides:
- Async database engine
- Async session factory
- Base class for ORM models
- Dependency injection for database sessions
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from app.config import settings

# Create async engine
# echo=settings.debug enables SQL query logging in debug mode
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,  # Connection pool size
    max_overflow=10,  # Max overflow connections
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

# Base class for all ORM models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting database sessions in FastAPI routes.

    Usage:
        @app.get("/example")
        async def example(db: AsyncSession = Depends(get_db)):
            # Use db session here
            pass

    Yields:
        AsyncSession: Database session that will be automatically closed
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database connection.

    Called on application startup to verify database connectivity.
    """
    async with engine.begin() as conn:
        # This will verify the connection works
        await conn.run_sync(lambda _: None)


async def close_db() -> None:
    """
    Close database connection pool.

    Called on application shutdown to cleanly close all connections.
    """
    await engine.dispose()
