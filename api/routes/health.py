from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    summary="Health check",
    description="Simple uptime check for the GhostTrap API service."
)
def health_check():
    return {
        "status": "ok"
    }
