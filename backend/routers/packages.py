from fastapi import APIRouter, Depends
from core.security import get_current_user, get_admin_user
from typing import List

router = APIRouter()

@router.get("/list")
async def list_packages(current_user = Depends(get_current_user)):
    """List installed packages"""
    import subprocess
    
    try:
        result = subprocess.run(
            ['dpkg-query', '-W', '-f=${Package}\t${Version}\n'],
            capture_output=True,
            text=True
        )
        
        packages = []
        for line in result.stdout.strip().split('\n')[:100]:  # Limit to 100
            if '\t' in line:
                name, version = line.split('\t', 1)
                packages.append({"name": name, "version": version})
        
        return {"packages": packages, "count": len(packages)}
    except Exception as e:
        return {"packages": [], "error": str(e)}

@router.get("/search")
async def search_packages(
    query: str,
    current_user = Depends(get_current_user)
):
    """Search for packages"""
    return {"query": query, "results": []}