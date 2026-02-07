# Monitoring Daemon Configuration
# This script runs as a background daemon for system monitoring

import asyncio
import logging
import sys
sys.path.insert(0, '/app/backend')

from core.monitoring_service import MonitoringService
from core.websocket_manager import WebSocketManager

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('/var/log/umc/monitoring.log')
    ]
)

logger = logging.getLogger(__name__)

async def main():
    """Main monitoring daemon"""
    websocket_manager = WebSocketManager()
    monitoring = MonitoringService(websocket_manager)
    
    await monitoring.start()
    logger.info("Monitoring daemon started")
    
    try:
        while True:
            await asyncio.sleep(60)
    except KeyboardInterrupt:
        await monitoring.stop()
        logger.info("Monitoring daemon stopped")

if __name__ == "__main__":
    asyncio.run(main())