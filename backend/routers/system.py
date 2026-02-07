from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import subprocess
import psutil
import os
from datetime import datetime

from core.database import get_db, User
from core.security import get_current_user, get_admin_user

router = APIRouter()

@router.get("/info")
async def get_system_info(current_user: User = Depends(get_current_user)):
    """Get detailed system information"""
    import platform
    import socket
    
    # Get OS info
    try:
        with open('/etc/os-release', 'r') as f:
            os_info = {}
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    os_info[key] = value.strip('"')
    except:
        os_info = {}
    
    # Get kernel info
    uname = os.uname()
    
    # Get uptime
    uptime = datetime.now() - datetime.fromtimestamp(psutil.boot_time())
    
    # Get timezone
    try:
        timezone = subprocess.check_output(['timedatectl', 'show', '--property=Timezone', '--value'], 
                                         text=True).strip()
    except:
        timezone = "Unknown"
    
    return {
        "hostname": socket.gethostname(),
        "os": {
            "name": os_info.get('NAME', 'Unknown'),
            "version": os_info.get('VERSION', 'Unknown'),
            "id": os_info.get('ID', 'unknown'),
            "codename": os_info.get('VERSION_CODENAME', 'unknown')
        },
        "kernel": {
            "name": uname.sysname,
            "release": uname.release,
            "version": uname.version,
            "machine": uname.machine
        },
        "uptime": {
            "seconds": uptime.total_seconds(),
            "formatted": str(uptime).split('.')[0]
        },
        "timezone": timezone,
        "locale": os.getenv('LANG', 'Unknown')
    }

@router.post("/restart")
async def restart_system(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_admin_user)
):
    """Restart the system"""
    def do_restart():
        import time
        time.sleep(2)
        subprocess.run(['systemctl', 'reboot'])
    
    background_tasks.add_task(do_restart)
    return {"message": "System restart initiated", "warning": "System will restart in 2 seconds"}

@router.post("/shutdown")
async def shutdown_system(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_admin_user)
):
    """Shutdown the system"""
    def do_shutdown():
        import time
        time.sleep(2)
        subprocess.run(['systemctl', 'poweroff'])
    
    background_tasks.add_task(do_shutdown)
    return {"message": "System shutdown initiated", "warning": "System will shutdown in 2 seconds"}

@router.get("/hostname")
async def get_hostname(current_user: User = Depends(get_current_user)):
    """Get system hostname"""
    import socket
    return {"hostname": socket.gethostname()}

@router.put("/hostname")
async def set_hostname(
    hostname: str,
    current_user: User = Depends(get_admin_user)
):
    """Set system hostname"""
    try:
        subprocess.run(['hostnamectl', 'set-hostname', hostname], check=True)
        return {"message": f"Hostname changed to {hostname}", "hostname": hostname}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=f"Failed to set hostname: {e}")

@router.get("/timezone")
async def get_timezone(current_user: User = Depends(get_current_user)):
    """Get system timezone"""
    try:
        result = subprocess.check_output(['timedatectl', 'show', '--property=Timezone', '--value'], 
                                       text=True).strip()
        return {"timezone": result}
    except:
        return {"timezone": "Unknown"}

@router.put("/timezone")
async def set_timezone(
    timezone: str,
    current_user: User = Depends(get_admin_user)
):
    """Set system timezone"""
    try:
        subprocess.run(['timedatectl', 'set-timezone', timezone], check=True)
        return {"message": f"Timezone changed to {timezone}", "timezone": timezone}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=f"Failed to set timezone: {e}")

@router.get("/time")
async def get_system_time(current_user: User = Depends(get_current_user)):
    """Get current system time"""
    return {
        "datetime": datetime.now().isoformat(),
        "timestamp": datetime.now().timestamp(),
        "utc": datetime.utcnow().isoformat()
    }

@router.post("/clear-cache")
async def clear_system_cache(current_user: User = Depends(get_admin_user)):
    """Clear system cache"""
    try:
        # Clear page cache, dentries and inodes
        subprocess.run(['sync'], check=True)
        with open('/proc/sys/vm/drop_caches', 'w') as f:
            f.write('3')
        return {"message": "System cache cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear cache: {e}")