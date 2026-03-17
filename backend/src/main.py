from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="DermaAI Backend",
        version="1.0.0",
    )

    # ── CORS — allow frontend on localhost:3000 ────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix="/api")
    return app

app = create_app()