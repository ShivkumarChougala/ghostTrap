from fastapi import FastAPI
from api.routes.health import router as health_router
from api.routes.dashboard import router as dashboard_router

app = FastAPI(
    title="GhostTrap API",
    description="API for GhostTrap SSH honeypot dashboard data",
    version="1.0.0"
)

app.include_router(health_router)
app.include_router(dashboard_router)
