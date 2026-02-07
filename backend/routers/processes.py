from fastapi import APIRouter, Depends
from core.security import get_current_user
import psutil

router = APIRouter()

@router.get("/list")
async def list_processes(
    current_user = Depends(get_current_user),
    sort_by: str = "memory",
    limit: int = 50
):
    """List running processes"""
    processes = []
    
    for proc in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_percent', 'status', 'create_time']):
        try:
            pinfo = proc.info
            processes.append({
                "pid": pinfo['pid'],
                "name": pinfo['name'],
                "username": pinfo['username'],
                "cpu_percent": pinfo['cpu_percent'],
                "memory_percent": pinfo['memory_percent'],
                "status": pinfo['status'],
                "created": pinfo['create_time']
            })
        except:
            pass
    
    # Sort by specified field
    if sort_by in ['cpu_percent', 'memory_percent', 'pid']:
        processes.sort(key=lambda x: x.get(sort_by, 0), reverse=True)
    
    return {
        "processes": processes[:limit],
        "total": len(processes)
    }

@router.get("/{pid}")
async def get_process_info(pid: int, current_user = Depends(get_current_user)):
    """Get detailed process information"""
    try:
        proc = psutil.Process(pid)
        
        return {
            "pid": pid,
            "name": proc.name(),
            "exe": proc.exe(),
            "cwd": proc.cwd(),
            "cmdline": proc.cmdline(),
            "status": proc.status(),
            "username": proc.username(),
            "cpu_percent": proc.cpu_percent(interval=0.1),
            "memory_info": proc.memory_info()._asdict(),
            "memory_percent": proc.memory_percent(),
            "create_time": proc.create_time(),
            "connections": len(proc.connections()),
            "threads": proc.num_threads(),
            "open_files": len(proc.open_files()),
            "children": len(proc.children())
        }
    except psutil.NoSuchProcess:
        return {"error": "Process not found"}