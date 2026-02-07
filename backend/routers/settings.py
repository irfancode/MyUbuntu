from fastapi import APIRouter, Depends
from core.security import get_current_user, get_admin_user

router = APIRouter()

@router.get("/settings")
async def get_settings(current_user = Depends(get_current_user)):
    """Get application settings"""
    return {
        "general": {
            "language": "en",
            "timezone": "UTC",
            "date_format": "YYYY-MM-DD"
        },
        "notifications": {
            "email_enabled": False,
            "slack_enabled": False,
            "discord_enabled": False
        },
        "monitoring": {
            "interval": 5,
            "retention_days": 30
        },
        "security": {
            "session_timeout": 60,
            "two_factor_enabled": False
        }
    }

@router.put("/settings")
async def update_settings(
    settings: dict,
    admin_user = Depends(get_admin_user)
):
    """Update application settings"""
    return {"message": "Settings updated", "settings": settings}