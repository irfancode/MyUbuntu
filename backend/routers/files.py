from fastapi import APIRouter, Depends
from core.security import get_current_user, get_admin_user
from typing import List, Optional
import os

router = APIRouter()

@router.get("/browse")
async def browse_files(
    path: str = "/home",
    current_user = Depends(get_current_user)
):
    """Browse files and directories"""
    try:
        items = []
        for item in os.listdir(path):
            full_path = os.path.join(path, item)
            stat = os.stat(full_path)
            items.append({
                "name": item,
                "path": full_path,
                "is_dir": os.path.isdir(full_path),
                "size": stat.st_size,
                "modified": stat.st_mtime,
                "permissions": oct(stat.st_mode)[-3:]
            })
        
        return {
            "current_path": path,
            "items": items
        }
    except Exception as e:
        return {"error": str(e), "items": []}

@router.get("/read")
async def read_file(
    path: str,
    current_user = Depends(get_current_user)
):
    """Read file content"""
    try:
        with open(path, 'r') as f:
            content = f.read()
        return {"content": content, "path": path}
    except Exception as e:
        return {"error": str(e)}