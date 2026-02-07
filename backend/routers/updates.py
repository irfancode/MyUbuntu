from fastapi import APIRouter, Depends, HTTPException
from core.security import get_current_user, get_admin_user
import subprocess

router = APIRouter()

@router.get("/updates")
async def check_updates(current_user = Depends(get_current_user)):
    """Check for available system updates"""
    try:
        # Update package list
        subprocess.run(['apt-get', 'update'], capture_output=True)
        
        # Check for upgrades
        result = subprocess.run(
            ['apt-get', '-s', 'upgrade'],
            capture_output=True,
            text=True
        )
        
        # Parse output to count packages
        lines = result.stdout.split('\n')
        packages = []
        
        for line in lines:
            if line.startswith('Inst'):
                parts = line.split()
                if len(parts) >= 2:
                    packages.append({
                        "name": parts[1],
                        "action": "upgrade" if len(parts) > 2 else "install"
                    })
        
        return {
            "update_count": len(packages),
            "packages": packages[:50],  # Limit to 50
            "has_updates": len(packages) > 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check updates: {e}")

@router.post("/upgrade")
async def upgrade_system(current_user = Depends(get_admin_user)):
    """Upgrade system packages"""
    try:
        # This is a placeholder - in production, this would run the actual upgrade
        return {
            "message": "System upgrade initiated",
            "warning": "This would upgrade all packages in a real environment"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upgrade: {e}")