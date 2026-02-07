from fastapi import APIRouter, Depends
from core.security import get_current_user
from typing import Optional

router = APIRouter()

@router.get("/metrics")
async def get_monitoring_metrics(
    current_user = Depends(get_current_user),
    interval: str = "5m"
):
    """Get monitoring metrics"""
    import psutil
    from datetime import datetime
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "cpu": {
            "percent": psutil.cpu_percent(interval=1),
            "count": psutil.cpu_count(),
            "per_cpu": psutil.cpu_percent(interval=1, percpu=True)
        },
        "memory": {
            "virtual": psutil.virtual_memory()._asdict(),
            "swap": psutil.swap_memory()._asdict()
        },
        "disk": psutil.disk_usage('/')._asdict(),
        "network": psutil.net_io_counters()._asdict(),
        "load_avg": psutil.getloadavg()
    }

@router.get("/history")
async def get_metrics_history(
    current_user = Depends(get_current_user),
    hours: int = 24
):
    """Get historical metrics"""
    # This would fetch from database in production
    return {
        "hours": hours,
        "data": [],
        "message": "Historical metrics would be fetched from database"
    }