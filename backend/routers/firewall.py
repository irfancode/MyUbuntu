from fastapi import APIRouter, Depends
from core.security import get_current_user, get_admin_user

router = APIRouter()

@router.get("/status")
async def get_firewall_status(current_user = Depends(get_current_user)):
    """Get firewall status"""
    import subprocess
    
    try:
        result = subprocess.run(
            ['ufw', 'status', 'verbose'],
            capture_output=True,
            text=True
        )
        
        return {
            "status": result.stdout if result.returncode == 0 else "inactive",
            "enabled": result.returncode == 0
        }
    except:
        return {"status": "unknown", "enabled": False}

@router.post("/enable")
async def enable_firewall(admin_user = Depends(get_admin_user)):
    """Enable firewall"""
    return {"message": "Firewall would be enabled"}

@router.post("/disable")
async def disable_firewall(admin_user = Depends(get_admin_user)):
    """Disable firewall"""
    return {"message": "Firewall would be disabled"}