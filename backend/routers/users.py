from fastapi import APIRouter, Depends
from core.security import get_current_user, get_admin_user

router = APIRouter()

@router.get("/list")
async def list_users(current_user = Depends(get_current_user)):
    """List system users"""
    import pwd
    users = []
    
    for user in pwd.getpwall():
        users.append({
            "username": user.pw_name,
            "uid": user.pw_uid,
            "gid": user.pw_gid,
            "home": user.pw_dir,
            "shell": user.pw_shell,
            "gecos": user.pw_gecos
        })
    
    return {"users": users}

@router.get("/current")
async def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current user information"""
    import os
    import pwd
    
    user = pwd.getpwuid(os.getuid())
    
    return {
        "username": user.pw_name,
        "uid": user.pw_uid,
        "gid": user.pw_gid,
        "home": user.pw_dir,
        "shell": user.pw_shell
    }

@router.post("/create")
async def create_user(
    username: str,
    password: str,
    shell: str = "/bin/bash",
    create_home: bool = True,
    admin_user = Depends(get_admin_user)
):
    """Create a new user (placeholder)"""
    return {"message": f"User creation would be implemented here for {username}"}