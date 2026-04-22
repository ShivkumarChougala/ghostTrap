from fastapi import APIRouter

router = APIRouter(tags=["Status"])


@router.get(
    "/status",
    summary="API status",
    description="Returns basic metadata about the GhostTrap API service."
)
def get_status():
    return {
        "data": {
            "status": "ok",
            "service": "ghosttrap-api",
            "version": "1.0.0"
        }
    }
