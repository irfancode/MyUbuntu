from fastapi import APIRouter, Depends
from core.security import get_current_user
import psutil

router = APIRouter()

@router.get("/disks")
async def get_disk_usage(current_user = Depends(get_current_user)):
    """Get disk usage information"""
    partitions = psutil.disk_partitions()
    disks = []
    
    for partition in partitions:
        try:
            usage = psutil.disk_usage(partition.mountpoint)
            disks.append({
                "device": partition.device,
                "mountpoint": partition.mountpoint,
                "fstype": partition.fstype,
                "opts": partition.opts,
                "total_gb": round(usage.total / (1024**3), 2),
                "used_gb": round(usage.used / (1024**3), 2),
                "free_gb": round(usage.free / (1024**3), 2),
                "percent": usage.percent
            })
        except:
            pass
    
    return {"disks": disks}

@router.get("/io")
async def get_disk_io(current_user = Depends(get_current_user)):
    """Get disk I/O statistics"""
    io = psutil.disk_io_counters()
    
    if io:
        return {
            "read_count": io.read_count,
            "write_count": io.write_count,
            "read_bytes": io.read_bytes,
            "write_bytes": io.write_bytes,
            "read_time": io.read_time,
            "write_time": io.write_time
        }
    return {"error": "No disk I/O data available"}