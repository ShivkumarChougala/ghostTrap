from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.health import router as health_router
from api.routes.status import router as status_router
from api.routes.overview import router as overview_router
from api.routes.analytics import router as analytics_router
from api.routes.sessions import router as sessions_router
from api.routes.ingest import router as ingest_router

from api.routes.threats import router as threats_router
from api.routes.ip_intel import router as ip_intel_router
from api.routes import reputation

app = FastAPI(
    title="GhostTrap API",
    description="API for GhostTrap SSH honeypot dashboard data",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.31.190:5173",
        "http://192.168.31.191:5173",
        "https://dashboard.thechougala.in",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(status_router, prefix="/api/v1")
app.include_router(overview_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(sessions_router, prefix="/api/v1")
app.include_router(ingest_router)
app.include_router(threats_router, prefix="/api/v1")
app.include_router(reputation.router, prefix="/api/v1")
app.include_router(ip_intel_router)
