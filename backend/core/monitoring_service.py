import asyncio
import psutil
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional
from sqlalchemy.orm import Session
from .websocket_manager import WebSocketManager
from .database import SystemMetric, SessionLocal

logger = logging.getLogger(__name__)

class MonitoringService:
    """System monitoring and metrics collection service"""
    
    def __init__(self, websocket_manager: WebSocketManager, interval: int = 5):
        self.websocket_manager = websocket_manager
        self.interval = interval
        self.running = False
        self.task: Optional[asyncio.Task] = None
        self.metrics_history: list = []
        self.max_history = 1440  # 2 hours at 5-second intervals
        
    async def start(self):
        """Start monitoring service"""
        self.running = True
        self.task = asyncio.create_task(self._monitoring_loop())
        logger.info("Monitoring service started")
    
    async def stop(self):
        """Stop monitoring service"""
        self.running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        logger.info("Monitoring service stopped")
    
    def is_running(self) -> bool:
        """Check if monitoring is running"""
        return self.running and (self.task is not None and not self.task.done())
    
    async def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.running:
            try:
                metrics = await self._collect_metrics()
                await self._store_metrics(metrics)
                await self._broadcast_metrics(metrics)
                await asyncio.sleep(self.interval)
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(self.interval)
    
    async def _collect_metrics(self) -> Dict:
        """Collect system metrics"""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            cpu_freq = psutil.cpu_freq()
            cpu_stats = psutil.cpu_stats()
            
            # Memory metrics
            memory = psutil.virtual_memory()
            swap = psutil.swap_memory()
            
            # Disk metrics
            disk = psutil.disk_usage('/')
            disk_io = psutil.disk_io_counters()
            
            # Network metrics
            network = psutil.net_io_counters()
            
            # Load average
            load_avg = psutil.getloadavg()
            
            # Uptime
            uptime = datetime.now() - datetime.fromtimestamp(psutil.boot_time())
            
            # Temperature sensors (if available)
            temperatures = {}
            try:
                temps = psutil.sensors_temperatures()
                for name, entries in temps.items():
                    temperatures[name] = [
                        {
                            "label": entry.label,
                            "current": entry.current,
                            "high": entry.high,
                            "critical": entry.critical
                        }
                        for entry in entries
                    ]
            except:
                pass
            
            # Battery info (if available)
            battery = None
            try:
                batt = psutil.sensors_battery()
                if batt:
                    battery = {
                        "percent": batt.percent,
                        "power_plugged": batt.power_plugged,
                        "secsleft": batt.secsleft
                    }
            except:
                pass
            
            metrics = {
                "timestamp": datetime.utcnow().isoformat(),
                "cpu": {
                    "percent": cpu_percent,
                    "count": cpu_count,
                    "frequency": cpu_freq._asdict() if cpu_freq else None,
                    "stats": cpu_stats._asdict() if cpu_stats else None
                },
                "memory": {
                    "percent": memory.percent,
                    "used": memory.used // (1024 * 1024),  # MB
                    "total": memory.total // (1024 * 1024),  # MB
                    "available": memory.available // (1024 * 1024),
                    "swap_percent": swap.percent,
                    "swap_used": swap.used // (1024 * 1024),
                    "swap_total": swap.total // (1024 * 1024)
                },
                "disk": {
                    "percent": disk.percent,
                    "used": disk.used // (1024 * 1024 * 1024),  # GB
                    "total": disk.total // (1024 * 1024 * 1024),  # GB
                    "free": disk.free // (1024 * 1024 * 1024)
                },
                "network": {
                    "sent": network.bytes_sent,
                    "recv": network.bytes_recv,
                    "packets_sent": network.packets_sent,
                    "packets_recv": network.packets_recv,
                    "errin": network.errin,
                    "errout": network.errout,
                    "dropin": network.dropin,
                    "dropout": network.dropout
                },
                "load_avg": {
                    "1min": load_avg[0],
                    "5min": load_avg[1],
                    "15min": load_avg[2]
                },
                "uptime": {
                    "seconds": uptime.total_seconds(),
                    "formatted": str(uptime).split('.')[0]
                },
                "temperatures": temperatures,
                "battery": battery
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error collecting metrics: {e}")
            return {}
    
    async def _store_metrics(self, metrics: Dict):
        """Store metrics in database"""
        try:
            db = SessionLocal()
            try:
                metric_record = SystemMetric(
                    timestamp=datetime.utcnow(),
                    cpu_percent=metrics.get("cpu", {}).get("percent"),
                    cpu_count=metrics.get("cpu", {}).get("count"),
                    memory_percent=metrics.get("memory", {}).get("percent"),
                    memory_used=metrics.get("memory", {}).get("used"),
                    memory_total=metrics.get("memory", {}).get("total"),
                    disk_percent=metrics.get("disk", {}).get("percent"),
                    disk_used=metrics.get("disk", {}).get("used"),
                    disk_total=metrics.get("disk", {}).get("total"),
                    network_sent=metrics.get("network", {}).get("sent"),
                    network_recv=metrics.get("network", {}).get("recv"),
                    load_avg_1=metrics.get("load_avg", {}).get("1min"),
                    load_avg_5=metrics.get("load_avg", {}).get("5min"),
                    load_avg_15=metrics.get("load_avg", {}).get("15min"),
                    uptime_seconds=int(metrics.get("uptime", {}).get("seconds", 0))
                )
                db.add(metric_record)
                db.commit()
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error storing metrics: {e}")
    
    async def _broadcast_metrics(self, metrics: Dict):
        """Broadcast metrics via WebSocket"""
        await self.websocket_manager.broadcast(
            {
                "type": "metrics",
                "data": metrics,
                "timestamp": datetime.utcnow().isoformat()
            },
            channel="system_metrics"
        )
    
    async def get_historical_metrics(
        self,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        interval: str = "5m"
    ) -> list:
        """Get historical metrics from database"""
        try:
            db = SessionLocal()
            try:
                query = db.query(SystemMetric)
                
                if start_time:
                    query = query.filter(SystemMetric.timestamp >= start_time)
                if end_time:
                    query = query.filter(SystemMetric.timestamp <= end_time)
                else:
                    # Default to last 24 hours
                    query = query.filter(
                        SystemMetric.timestamp >= datetime.utcnow() - timedelta(hours=24)
                    )
                
                # Order by timestamp descending
                query = query.order_by(SystemMetric.timestamp.desc())
                
                # Limit results based on interval
                limit_map = {
                    "1m": 60,
                    "5m": 288,  # 24 hours at 5 min intervals
                    "15m": 96,
                    "1h": 24,
                    "1d": 30
                }
                query = query.limit(limit_map.get(interval, 288))
                
                metrics = query.all()
                
                return [
                    {
                        "timestamp": m.timestamp.isoformat(),
                        "cpu_percent": m.cpu_percent,
                        "memory_percent": m.memory_percent,
                        "disk_percent": m.disk_percent,
                        "network_sent": m.network_sent,
                        "network_recv": m.network_recv,
                        "load_avg_1": m.load_avg_1
                    }
                    for m in reversed(metrics)
                ]
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error getting historical metrics: {e}")
            return []