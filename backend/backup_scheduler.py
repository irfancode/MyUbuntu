# Backup Scheduler
# Handles automated backup tasks

import asyncio
import logging
import sys
sys.path.insert(0, '/app/backend')

from core.backup_manager import BackupManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    """Backup scheduler daemon"""
    backup_manager = BackupManager()
    
    logger.info("Backup scheduler started")
    
    try:
        while True:
            # Cleanup old backups daily
            await backup_manager.cleanup_old_backups()
            await asyncio.sleep(86400)  # 24 hours
    except KeyboardInterrupt:
        logger.info("Backup scheduler stopped")

if __name__ == "__main__":
    asyncio.run(main())