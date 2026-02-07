from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import psutil
import platform
import socket

from core.database import get_db
from core.security import get_current_user
from core.database import User, SystemMetric

router = APIRouter()

@router.get("/overview")
async def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard overview data"""
    
    # System info
    system_info = {
        "hostname": socket.gethostname(),
        "platform": platform.system(),
        "platform_release": platform.release(),
        "platform_version": platform.version(),
        "architecture": platform.machine(),
        "processor": platform.processor(),
        "python_version": platform.python_version()
    }
    
    # Current metrics
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    # Uptime
    uptime = datetime.now() - datetime.fromtimestamp(psutil.boot_time())
    
    # Recent metrics for charts (last hour)
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    recent_metrics = db.query(SystemMetric).filter(
        SystemMetric.timestamp >= one_hour_ago
    ).order_by(SystemMetric.timestamp.asc()).all()
    
    metrics_history = [
        {
            "timestamp": m.timestamp.isoformat(),
            "cpu": m.cpu_percent,
            "memory": m.memory_percent,
            "disk": m.disk_percent
        }
        for m in recent_metrics
    ]
    
    # Active alerts count
    # This would come from alert manager in production
    active_alerts = 0
    
    # Service status summary
    # This would check actual services in production
    services_summary = {
        "running": 0,
        "stopped": 0,
        "total": 0
    }
    
    # Recent log entries count
    recent_logs = 0
    
    return {
        "system_info": system_info,
        "current_metrics": {
            "cpu": {
                "percent": cpu_percent,
                "cores": psutil.cpu_count()
            },
            "memory": {
                "percent": memory.percent,
                "used_gb": round(memory.used / (1024**3), 2),
                "total_gb": round(memory.total / (1024**3), 2)
            },
            "disk": {
                "percent": disk.percent,
                "used_gb": round(disk.used / (1024**3), 2),
                "total_gb": round(disk.total / (1024**3), 2)
            },
            "uptime": {
                "seconds": uptime.total_seconds(),
                "formatted": str(uptime).split('.')[0]
            }
        },
        "metrics_history": metrics_history,
        "active_alerts": active_alerts,
        "services_summary": services_summary,
        "recent_logs": recent_logs,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/quick-actions")
async def get_quick_actions(current_user: User = Depends(get_current_user)):
    """Get available quick actions"""
    actions = [
        {
            "id": "restart",
            "name": "Restart Server",
            "icon": "refresh",
            "description": "Restart the system",
            "requires_confirmation": True,
            "admin_only": True
        },
        {
            "id": "update",
            "name": "Update System",
            "icon": "download",
            "description": "Check and install system updates",
            "requires_confirmation": False,
            "admin_only": True
        },
        {
            "id": "clear-cache",
            "name": "Clear Cache",
            "icon": "trash",
            "description": "Clear system cache",
            "requires_confirmation": True,
            "admin_only": False
        },
        {
            "id": "backup",
            "name": "Create Backup",
            "icon": "save",
            "description": "Create a system backup",
            "requires_confirmation": False,
            "admin_only": True
        }
    ]
    
    return {"actions": actions}

@router.get("/resources")
async def get_resource_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed resource usage"""
    
    # CPU detailed
    cpu_freq = psutil.cpu_freq()
    cpu_stats = psutil.cpu_stats()
    
    # Memory detailed
    memory = psutil.virtual_memory()
    swap = psutil.swap_memory()
    
    # Disk detailed
    disk_partitions = psutil.disk_partitions()
    disks = []
    for partition in disk_partitions:
        try:
            usage = psutil.disk_usage(partition.mountpoint)
            disks.append({
                "device": partition.device,
                "mountpoint": partition.mountpoint,
                "fstype": partition.fstype,
                "percent": usage.percent,
                "used_gb": round(usage.used / (1024**3), 2),
                "total_gb": round(usage.total / (1024**3), 2)
            })
        except:
            pass
    
    # Network
    net_io = psutil.net_io_counters()
    net_connections = len(psutil.net_connections())
    
    return {
        "cpu": {
            "percent": psutil.cpu_percent(interval=1),
            "count": psutil.cpu_count(),
            "frequency": {
                "current": cpu_freq.current if cpu_freq else None,
                "min": cpu_freq.min if cpu_freq else None,
                "max": cpu_freq.max if cpu_freq else None
            } if cpu_freq else None,
            "stats": {
                "ctx_switches": cpu_stats.ctx_switches,
                "interrupts": cpu_stats.interrupts,
                "soft_interrupts": cpu_stats.soft_interrupts,
                "syscalls": cpu_stats.syscalls
            } if cpu_stats else None
        },
        "memory": {
            "virtual": {
                "percent": memory.percent,
                "used_gb": round(memory.used / (1024**3), 2),
                "total_gb": round(memory.total / (1024**3), 2),
                "available_gb": round(memory.available / (1024**3), 2)
            },
            "swap": {
                "percent": swap.percent,
                "used_gb": round(swap.used / (1024**3), 2),
                "total_gb": round(swap.total / (1024**3), 2)
            }
        },
        "disks": disks,
        "network": {
            "bytes_sent": net_io.bytes_sent,
            "bytes_recv": net_io.bytes_recv,
            "packets_sent": net_io.packets_sent,
            "packets_recv": net_io.packets_recv,
            "connections": net_connections
        }
    }