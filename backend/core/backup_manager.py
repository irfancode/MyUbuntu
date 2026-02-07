import os
import shutil
import tarfile
import gzip
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from .database import Backup, SessionLocal

logger = logging.getLogger(__name__)

class BackupManager:
    """Backup management system"""
    
    def __init__(self, backup_dir: str = "/app/backups"):
        self.backup_dir = backup_dir
        self.active_backups: Dict[str, dict] = {}
        os.makedirs(backup_dir, exist_ok=True)
    
    async def create_backup(
        self,
        name: str,
        source_path: str,
        backup_type: str = "full",
        compression: str = "gz",
        exclude_patterns: List[str] = None,
        retention_days: int = 30
    ) -> Optional[Backup]:
        """Create a new backup"""
        try:
            # Create backup record
            db = SessionLocal()
            try:
                backup = Backup(
                    name=name,
                    type=backup_type,
                    source_path=source_path,
                    destination=self.backup_dir,
                    status="running",
                    retention_days=retention_days
                )
                db.add(backup)
                db.commit()
                db.refresh(backup)
                
                # Generate backup filename
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                backup_filename = f"{name}_{timestamp}.tar.{compression}"
                backup_path = os.path.join(self.backup_dir, backup_filename)
                
                self.active_backups[str(backup.id)] = {
                    "id": backup.id,
                    "name": name,
                    "status": "running",
                    "started_at": datetime.utcnow().isoformat()
                }
                
                # Create backup archive
                await self._create_archive(
                    source_path,
                    backup_path,
                    compression,
                    exclude_patterns
                )
                
                # Update backup record
                backup.status = "completed"
                backup.completed_at = datetime.utcnow()
                backup.size_bytes = os.path.getsize(backup_path)
                db.commit()
                
                del self.active_backups[str(backup.id)]
                
                logger.info(f"Backup completed: {name}")
                return backup
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error creating backup {name}: {e}")
            # Update backup record with error
            try:
                db = SessionLocal()
                backup = db.query(Backup).filter(Backup.name == name).order_by(Backup.created_at.desc()).first()
                if backup:
                    backup.status = "failed"
                    backup.error_message = str(e)
                    db.commit()
                db.close()
            except:
                pass
            return None
    
    async def _create_archive(
        self,
        source_path: str,
        backup_path: str,
        compression: str,
        exclude_patterns: List[str] = None
    ):
        """Create compressed archive"""
        mode = "w:gz" if compression == "gz" else "w:bz2" if compression == "bz2" else "w"
        
        with tarfile.open(backup_path, mode) as tar:
            def exclude_filter(member):
                if exclude_patterns:
                    for pattern in exclude_patterns:
                        if pattern in member.name:
                            return False
                return True
            
            tar.add(source_path, arcname=os.path.basename(source_path), filter=exclude_filter)
    
    async def restore_backup(self, backup_id: int, target_path: str) -> bool:
        """Restore from backup"""
        try:
            db = SessionLocal()
            try:
                backup = db.query(Backup).filter(Backup.id == backup_id).first()
                if not backup:
                    return False
                
                # Find backup file
                backup_files = [
                    f for f in os.listdir(self.backup_dir)
                    if f.startswith(backup.name) and f.endswith(('.tar.gz', '.tar.bz2', '.tar'))
                ]
                
                if not backup_files:
                    return False
                
                backup_path = os.path.join(self.backup_dir, sorted(backup_files)[-1])
                
                # Extract backup
                with tarfile.open(backup_path, "r:*") as tar:
                    tar.extractall(target_path)
                
                logger.info(f"Backup restored: {backup.name} to {target_path}")
                return True
                
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error restoring backup {backup_id}: {e}")
            return False
    
    def list_backups(self) -> List[dict]:
        """List all backups"""
        try:
            db = SessionLocal()
            try:
                backups = db.query(Backup).order_by(Backup.created_at.desc()).all()
                return [
                    {
                        "id": b.id,
                        "name": b.name,
                        "type": b.type,
                        "source": b.source_path,
                        "size_mb": round(b.size_bytes / (1024 * 1024), 2) if b.size_bytes else 0,
                        "status": b.status,
                        "created_at": b.created_at.isoformat() if b.created_at else None,
                        "completed_at": b.completed_at.isoformat() if b.completed_at else None
                    }
                    for b in backups
                ]
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error listing backups: {e}")
            return []
    
    async def delete_backup(self, backup_id: int) -> bool:
        """Delete a backup"""
        try:
            db = SessionLocal()
            try:
                backup = db.query(Backup).filter(Backup.id == backup_id).first()
                if not backup:
                    return False
                
                # Find and delete backup files
                backup_files = [
                    f for f in os.listdir(self.backup_dir)
                    if f.startswith(backup.name)
                ]
                
                for f in backup_files:
                    os.remove(os.path.join(self.backup_dir, f))
                
                # Delete record
                db.delete(backup)
                db.commit()
                
                logger.info(f"Backup deleted: {backup.name}")
                return True
                
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error deleting backup {backup_id}: {e}")
            return False
    
    async def cleanup_old_backups(self):
        """Remove backups older than retention period"""
        try:
            db = SessionLocal()
            try:
                cutoff_date = datetime.utcnow() - timedelta(days=30)
                old_backups = db.query(Backup).filter(
                    Backup.created_at < cutoff_date
                ).all()
                
                for backup in old_backups:
                    await self.delete_backup(backup.id)
                
                logger.info(f"Cleaned up {len(old_backups)} old backups")
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error cleaning up old backups: {e}")