import asyncio
import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from .websocket_manager import WebSocketManager
from .database import Alert, AlertHistory, SessionLocal, get_db

logger = logging.getLogger(__name__)

class AlertManager:
    """Alert management and notification system"""
    
    def __init__(self, websocket_manager: WebSocketManager, check_interval: int = 60):
        self.websocket_manager = websocket_manager
        self.check_interval = check_interval
        self.running = False
        self.task: Optional[asyncio.Task] = None
        self.active_alerts: Dict[str, dict] = {}
        self.notification_channels: Dict[str, dict] = {
            "email": {"enabled": False, "config": {}},
            "slack": {"enabled": False, "config": {}},
            "discord": {"enabled": False, "config": {}},
            "webhook": {"enabled": False, "config": {}},
            "sms": {"enabled": False, "config": {}}
        }
    
    async def start(self):
        """Start alert manager"""
        self.running = True
        self.task = asyncio.create_task(self._alert_loop())
        logger.info("Alert manager started")
    
    async def stop(self):
        """Stop alert manager"""
        self.running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        logger.info("Alert manager stopped")
    
    def is_running(self) -> bool:
        """Check if alert manager is running"""
        return self.running and (self.task is not None and not self.task.done())
    
    async def _alert_loop(self):
        """Main alert checking loop"""
        while self.running:
            try:
                await self._check_alerts()
                await asyncio.sleep(self.check_interval)
            except Exception as e:
                logger.error(f"Error in alert loop: {e}")
                await asyncio.sleep(self.check_interval)
    
    async def _check_alerts(self):
        """Check all alert rules"""
        try:
            db = SessionLocal()
            try:
                alerts = db.query(Alert).filter(Alert.is_active == True).all()
                
                for alert in alerts:
                    triggered = await self._evaluate_alert(alert)
                    
                    if triggered and alert.name not in self.active_alerts:
                        # Alert triggered
                        await self._trigger_alert(db, alert)
                    elif not triggered and alert.name in self.active_alerts:
                        # Alert resolved
                        await self._resolve_alert(db, alert)
                        
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error checking alerts: {e}")
    
    async def _evaluate_alert(self, alert: Alert) -> bool:
        """Evaluate an alert condition"""
        try:
            condition = json.loads(alert.condition)
            metric = condition.get("metric")
            operator = condition.get("operator")
            threshold = condition.get("threshold")
            duration = condition.get("duration", 0)
            
            # Get current metric value
            current_value = await self._get_metric_value(metric)
            
            if current_value is None:
                return False
            
            # Evaluate condition
            triggered = False
            if operator == "gt":
                triggered = current_value > threshold
            elif operator == "gte":
                triggered = current_value >= threshold
            elif operator == "lt":
                triggered = current_value < threshold
            elif operator == "lte":
                triggered = current_value <= threshold
            elif operator == "eq":
                triggered = current_value == threshold
            elif operator == "neq":
                triggered = current_value != threshold
            
            return triggered
            
        except Exception as e:
            logger.error(f"Error evaluating alert {alert.name}: {e}")
            return False
    
    async def _get_metric_value(self, metric: str) -> Optional[float]:
        """Get current value for a metric"""
        import psutil
        
        try:
            if metric == "cpu_percent":
                return psutil.cpu_percent(interval=1)
            elif metric == "memory_percent":
                return psutil.virtual_memory().percent
            elif metric == "disk_percent":
                return psutil.disk_usage('/').percent
            elif metric == "load_avg_1":
                return psutil.getloadavg()[0]
            elif metric == "load_avg_5":
                return psutil.getloadavg()[1]
            elif metric == "load_avg_15":
                return psutil.getloadavg()[2]
            elif metric.startswith("disk_io_"):
                io = psutil.disk_io_counters()
                if io:
                    return getattr(io, metric.replace("disk_io_", ""), None)
            elif metric.startswith("net_"):
                net = psutil.net_io_counters()
                if net:
                    return getattr(net, metric.replace("net_", ""), None)
            return None
        except Exception as e:
            logger.error(f"Error getting metric {metric}: {e}")
            return None
    
    async def _trigger_alert(self, db: Session, alert: Alert):
        """Handle alert trigger"""
        try:
            # Update alert
            alert.triggered_at = datetime.utcnow()
            db.commit()
            
            # Add to history
            history = AlertHistory(
                alert_id=alert.id,
                triggered_at=datetime.utcnow(),
                message=f"Alert triggered: {alert.name}",
                severity=alert.severity
            )
            db.add(history)
            db.commit()
            
            # Add to active alerts
            self.active_alerts[alert.name] = {
                "id": alert.id,
                "name": alert.name,
                "severity": alert.severity,
                "triggered_at": datetime.utcnow().isoformat(),
                "message": alert.description
            }
            
            # Send WebSocket notification
            await self.websocket_manager.broadcast(
                {
                    "type": "alert_triggered",
                    "alert": {
                        "id": alert.id,
                        "name": alert.name,
                        "severity": alert.severity,
                        "message": alert.description,
                        "triggered_at": datetime.utcnow().isoformat()
                    }
                },
                channel="alerts"
            )
            
            # Send notifications
            await self._send_notifications(alert, "triggered")
            
            logger.warning(f"Alert triggered: {alert.name}")
            
        except Exception as e:
            logger.error(f"Error triggering alert {alert.name}: {e}")
    
    async def _resolve_alert(self, db: Session, alert: Alert):
        """Handle alert resolution"""
        try:
            # Update alert
            alert.resolved_at = datetime.utcnow()
            db.commit()
            
            # Update history
            history = db.query(AlertHistory).filter(
                AlertHistory.alert_id == alert.id,
                AlertHistory.resolved_at.is_(None)
            ).order_by(AlertHistory.triggered_at.desc()).first()
            
            if history:
                history.resolved_at = datetime.utcnow()
                db.commit()
            
            # Remove from active alerts
            if alert.name in self.active_alerts:
                del self.active_alerts[alert.name]
            
            # Send WebSocket notification
            await self.websocket_manager.broadcast(
                {
                    "type": "alert_resolved",
                    "alert": {
                        "id": alert.id,
                        "name": alert.name,
                        "resolved_at": datetime.utcnow().isoformat()
                    }
                },
                channel="alerts"
            )
            
            logger.info(f"Alert resolved: {alert.name}")
            
        except Exception as e:
            logger.error(f"Error resolving alert {alert.name}: {e}")
    
    async def _send_notifications(self, alert: Alert, status: str):
        """Send notifications through configured channels"""
        channels = alert.notification_channels or []
        
        for channel in channels:
            try:
                if channel == "email" and self.notification_channels["email"]["enabled"]:
                    await self._send_email_notification(alert, status)
                elif channel == "slack" and self.notification_channels["slack"]["enabled"]:
                    await self._send_slack_notification(alert, status)
                elif channel == "discord" and self.notification_channels["discord"]["enabled"]:
                    await self._send_discord_notification(alert, status)
                elif channel == "webhook" and self.notification_channels["webhook"]["enabled"]:
                    await self._send_webhook_notification(alert, status)
            except Exception as e:
                logger.error(f"Error sending {channel} notification: {e}")
    
    async def _send_email_notification(self, alert: Alert, status: str):
        """Send email notification"""
        # Implementation for email notifications
        pass
    
    async def _send_slack_notification(self, alert: Alert, status: str):
        """Send Slack notification"""
        # Implementation for Slack notifications
        pass
    
    async def _send_discord_notification(self, alert: Alert, status: str):
        """Send Discord notification"""
        # Implementation for Discord notifications
        pass
    
    async def _send_webhook_notification(self, alert: Alert, status: str):
        """Send webhook notification"""
        # Implementation for webhook notifications
        pass
    
    def get_active_alerts(self) -> List[dict]:
        """Get list of active alerts"""
        return list(self.active_alerts.values())
    
    def configure_notification_channel(self, channel: str, config: dict):
        """Configure a notification channel"""
        if channel in self.notification_channels:
            self.notification_channels[channel]["enabled"] = config.get("enabled", False)
            self.notification_channels[channel]["config"] = config.get("settings", {})
            return True
        return False