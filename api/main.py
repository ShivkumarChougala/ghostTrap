from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.health import router as health_router
from api.routes.dashboard import router as dashboard_router

app = FastAPI(
    title="GhostTrap API",
    description="API for GhostTrap SSH honeypot dashboard data",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://192.168.31.190:5173",
        "http://localhost:5173",
        "http://192.168.31.191:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(dashboard_router)
