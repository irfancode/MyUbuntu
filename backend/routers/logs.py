from fastapi import APIRouter, Depends
from core.security import get_current_user
from typing import List, Optional

router = APIRouter()

@router.get("/list")
async def get_logs(
    current_user = Depends(get_current_user),
    service: Optional[str] = None,
    lines: int = 100
):
    """Get system logs"""
    import subprocess
    
    try:
        if service:
            result = subprocess.run(
                ['journalctl', '-u', service, '-n', str(lines), '--no-pager'],
                capture_output=True,
                text=True
            )
        else:
            result = subprocess.run(
                ['journalctl', '-n', str(lines), '--no-pager'],
                capture_output=True,
                text=True
            )
        
        return {
            "logs": result.stdout.strip().split('\n') if result.returncode == 0 else [],
            "service": service,
            "lines": lines
        }
    except Exception as e:
        return {"logs": [], "error": str(e)}

@router.get("/services")
async def get_log_services(current_user = Depends(get_current_user)):
    """Get list of services with logs"""
    return {"services": []}