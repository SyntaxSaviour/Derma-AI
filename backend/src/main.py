from fastapi import FastAPI

from api.routes import router as api_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="DermaAI Backend",
        version="1.0.0",
    )

    app.include_router(api_router, prefix="/api")

    return app


app = create_app()

