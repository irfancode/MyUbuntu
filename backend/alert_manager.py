# Alert Manager
# Processes and sends alert notifications

import asyncio
import logging
import sys
sys.path.insert(0, '/app/backend')

from core.alert_manager import AlertManager
from core.websocket_manager import WebSocketManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    """Alert manager daemon"""
    websocket_manager = WebSocketManager()
    alert_manager = AlertManager(websocket_manager)
    
    await alert_manager.start()
    logger.info("Alert manager started")
    
    try:
        while True:
            await asyncio.sleep(3600)
    except KeyboardInterrupt:
        await alert_manager.stop()
        logger.info("Alert manager stopped")

if __name__ == "__main__":
    asyncio.run(main())