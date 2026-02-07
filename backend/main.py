#!/usr/bin/env python3
"""
Ubuntu Master Control - Main Application
A comprehensive server management tool with Apple-inspired design
"""

import os
import sys
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.config import Settings, get_settings
from core.database import init_db, get_db
from core.security import verify_token, create_access_token
from core.websocket_manager import WebSocketManager
from core.scheduler import SchedulerManager
from core.monitoring_service import MonitoringService
from core.alert_manager import AlertManager
from core.backup_manager import BackupManager

# Import routers
from routers import (
    auth,
    dashboard,
    system,
    users,
    services,
    network,
    storage,
    packages,
    firewall,
    logs,
    terminal,
    monitoring,
    alerts,
    backup,
    ssl_certificates,
    updates,
    processes,
    files,
    docker_mgr,
    database,
    settings as settings_router
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('/var/log/umc/app.log')
    ]
)
logger = logging.getLogger(__name__)

# Global instances
websocket_manager: Optional[WebSocketManager] = None
monitoring_service: Optional[MonitoringService] = None
alert_manager: Optional[AlertManager] = None
backup_manager: Optional[BackupManager] = None
scheduler: Optional[SchedulerManager] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global websocket_manager, monitoring_service, alert_manager, backup_manager, scheduler
    
    # Startup
    logger.info("Starting Ubuntu Master Control...")
    
    # Initialize database
    await init_db()
    
    # Initialize WebSocket manager
    websocket_manager = WebSocketManager()
    
    # Initialize monitoring service
    monitoring_service = MonitoringService(websocket_manager)
    await monitoring_service.start()
    
    # Initialize alert manager
    alert_manager = AlertManager(websocket_manager)
    await alert_manager.start()
    
    # Initialize backup manager
    backup_manager = BackupManager()
    
    # Initialize scheduler
    scheduler = SchedulerManager()
    await scheduler.start()
    
    logger.info("Ubuntu Master Control started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Ubuntu Master Control...")
    
    if scheduler:
        await scheduler.stop()
    if alert_manager:
        await alert_manager.stop()
    if monitoring_service:
        await monitoring_service.stop()
    
    logger.info("Ubuntu Master Control shut down successfully")


# Create FastAPI application
app = FastAPI(
    title="Ubuntu Master Control",
    description="Complete Server Management Platform with Apple-inspired Design",
    version="1.0.0",
    docs_url="/api/docs" if os.getenv("NODE_ENV") != "production" else None,
    redoc_url="/api/redoc" if os.getenv("NODE_ENV") != "production" else None,
    openapi_url="/api/openapi.json" if os.getenv("NODE_ENV") != "production" else None,
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    """Log all requests"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(
        f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s"
    )
    
    return response


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(system.router, prefix="/api/system", tags=["System"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(network.router, prefix="/api/network", tags=["Network"])
app.include_router(storage.router, prefix="/api/storage", tags=["Storage"])
app.include_router(packages.router, prefix="/api/packages", tags=["Packages"])
app.include_router(firewall.router, prefix="/api/firewall", tags=["Firewall"])
app.include_router(logs.router, prefix="/api/logs", tags=["Logs"])
app.include_router(terminal.router, prefix="/api/terminal", tags=["Terminal"])
app.include_router(monitoring.router, prefix="/api/monitoring", tags=["Monitoring"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(backup.router, prefix="/api/backup", tags=["Backup"])
app.include_router(ssl_certificates.router, prefix="/api/ssl", tags=["SSL Certificates"])
app.include_router(updates.router, prefix="/api/updates", tags=["Updates"])
app.include_router(processes.router, prefix="/api/processes", tags=["Processes"])
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(docker_mgr.router, prefix="/api/docker", tags=["Docker"])
app.include_router(database.router, prefix="/api/database", tags=["Database"])
app.include_router(settings_router.router, prefix="/api/settings", tags=["Settings"])


# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "monitoring": monitoring_service is not None and monitoring_service.is_running(),
            "alerts": alert_manager is not None and alert_manager.is_running(),
            "scheduler": scheduler is not None and scheduler.is_running()
        }
    }


# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle client messages
            data = await websocket.receive_json()
            await websocket_manager.handle_message(websocket, data)
    except WebSocketDisconnect:
        await websocket_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket_manager.disconnect(websocket)


# Serve static files (React frontend)
if os.path.exists("/app/frontend/build"):
    app.mount("/static", StaticFiles(directory="/app/frontend/build/static"), name="static")
    
    @app.get("/")
    async def serve_frontend():
        return FileResponse("/app/frontend/build/index.html")
    
    @app.get("/{path:path}")
    async def serve_frontend_catchall(path: str):
        if path.startswith("api/") or path == "ws":
            raise HTTPException(status_code=404, detail="Not found")
        return FileResponse("/app/frontend/build/index.html")


import time
from datetime import datetime

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("UMC_PORT", 8443)),
        ssl_keyfile="/app/config/ssl/server.key" if os.getenv("UMC_ENABLE_SSL") == "true" else None,
        ssl_certfile="/app/config/ssl/server.crt" if os.getenv("UMC_ENABLE_SSL") == "true" else None,
        reload=os.getenv("NODE_ENV") != "production"
    )