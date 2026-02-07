from fastapi import APIRouter, Depends
from core.security import get_current_user, get_admin_user

router = APIRouter()

@router.get("/status")
async def get_docker_status(current_user = Depends(get_current_user)):
    """Get Docker status"""
    import subprocess
    
    try:
        result = subprocess.run(
            ['docker', 'info', '--format', '{{json .}}'],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            import json
            return json.loads(result.stdout)
        else:
            return {"error": "Docker not accessible", "running": False}
    except:
        return {"error": "Docker not installed", "running": False}

@router.get("/containers")
async def list_containers(current_user = Depends(get_current_user)):
    """List Docker containers"""
    import subprocess
    
    try:
        result = subprocess.run(
            ['docker', 'ps', '-a', '--format', '{{json .}}'],
            capture_output=True,
            text=True
        )
        
        containers = []
        for line in result.stdout.strip().split('\n'):
            if line:
                import json
                containers.append(json.loads(line))
        
        return {"containers": containers, "count": len(containers)}
    except Exception as e:
        return {"containers": [], "error": str(e)}