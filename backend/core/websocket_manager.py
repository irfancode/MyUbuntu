import asyncio
import json
import logging
from typing import List, Dict, Set
from fastapi import WebSocket
from datetime import datetime

logger = logging.getLogger(__name__)

class WebSocketManager:
    """Manages WebSocket connections and message broadcasting"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_metadata: Dict[WebSocket, dict] = {}
        self.subscriptions: Dict[str, Set[WebSocket]] = {
            "system_metrics": set(),
            "alerts": set(),
            "logs": set(),
            "processes": set(),
            "services": set(),
            "notifications": set()
        }
    
    async def connect(self, websocket: WebSocket):
        """Accept new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        self.connection_metadata[websocket] = {
            "connected_at": datetime.utcnow(),
            "client_info": {},
            "subscriptions": set()
        }
        logger.info(f"New WebSocket connection. Total: {len(self.active_connections)}")
    
    async def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        if websocket in self.connection_metadata:
            # Unsubscribe from all channels
            for channel in self.connection_metadata[websocket].get("subscriptions", set()):
                if channel in self.subscriptions:
                    self.subscriptions[channel].discard(websocket)
            del self.connection_metadata[websocket]
        
        logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")
    
    async def handle_message(self, websocket: WebSocket, data: dict):
        """Handle incoming WebSocket message"""
        message_type = data.get("type")
        
        if message_type == "subscribe":
            channel = data.get("channel")
            await self.subscribe(websocket, channel)
        elif message_type == "unsubscribe":
            channel = data.get("channel")
            await self.unsubscribe(websocket, channel)
        elif message_type == "ping":
            await websocket.send_json({"type": "pong", "timestamp": datetime.utcnow().isoformat()})
        elif message_type == "auth":
            # Handle authentication
            token = data.get("token")
            self.connection_metadata[websocket]["authenticated"] = bool(token)
    
    async def subscribe(self, websocket: WebSocket, channel: str):
        """Subscribe WebSocket to a channel"""
        if channel in self.subscriptions:
            self.subscriptions[channel].add(websocket)
            self.connection_metadata[websocket]["subscriptions"].add(channel)
            await websocket.send_json({
                "type": "subscribed",
                "channel": channel,
                "timestamp": datetime.utcnow().isoformat()
            })
    
    async def unsubscribe(self, websocket: WebSocket, channel: str):
        """Unsubscribe WebSocket from a channel"""
        if channel in self.subscriptions:
            self.subscriptions[channel].discard(websocket)
            self.connection_metadata[websocket]["subscriptions"].discard(channel)
            await websocket.send_json({
                "type": "unsubscribed",
                "channel": channel,
                "timestamp": datetime.utcnow().isoformat()
            })
    
    async def broadcast(self, message: dict, channel: str = None):
        """Broadcast message to all or specific channel subscribers"""
        if channel and channel in self.subscriptions:
            connections = list(self.subscriptions[channel])
        else:
            connections = self.active_connections
        
        disconnected = []
        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            await self.disconnect(conn)
    
    async def send_to_client(self, websocket: WebSocket, message: dict):
        """Send message to specific client"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending message to client: {e}")
            await self.disconnect(websocket)
    
    def get_connection_count(self) -> int:
        """Get number of active connections"""
        return len(self.active_connections)
    
    def get_channel_subscribers(self, channel: str) -> int:
        """Get number of subscribers for a channel"""
        return len(self.subscriptions.get(channel, set()))