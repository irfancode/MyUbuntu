from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import subprocess
import psutil
from typing import List, Optional
from pydantic import BaseModel

from core.database import get_db, User
from core.security import get_current_user, get_admin_user

router = APIRouter()

class ServiceAction(BaseModel):
    action: str  # start, stop, restart, enable, disable

@router.get("/list")
async def list_services(current_user: User = Depends(get_current_user)):
    """List all system services"""
    try:
        # Get all systemd services
        result = subprocess.run(
            ['systemctl', 'list-units', '--type=service', '--all', '--no-pager', '--no-legend'],
            capture_output=True,
            text=True
        )
        
        services = []
        for line in result.stdout.strip().split('\n'):
            parts = line.split()
            if len(parts) >= 4:
                service_name = parts[0]
                load_state = parts[1]
                active_state = parts[2]
                sub_state = parts[3]
                
                # Get service details
                services.append({
                    "name": service_name.replace('.service', ''),
                    "full_name": service_name,
                    "load_state": load_state,
                    "active_state": active_state,
                    "sub_state": sub_state,
                    "description": ' '.join(parts[4:]) if len(parts) > 4 else ""
                })
        
        return {"services": services, "count": len(services)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list services: {e}")

@router.get("/{service_name}")
async def get_service_info(
    service_name: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a service"""
    try:
        # Check if service exists
        result = subprocess.run(
            ['systemctl', 'show', service_name, '--property=Id,Description,LoadState,ActiveState,SubState,UnitFileState,MainPID,MemoryCurrent,CPUUsageNSec'],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise HTTPException(status_code=404, detail=f"Service {service_name} not found")
        
        # Parse properties
        properties = {}
        for line in result.stdout.strip().split('\n'):
            if '=' in line:
                key, value = line.split('=', 1)
                properties[key] = value
        
        # Get service logs (last 10 lines)
        logs_result = subprocess.run(
            ['journalctl', '-u', service_name, '-n', '10', '--no-pager'],
            capture_output=True,
            text=True
        )
        
        return {
            "name": service_name,
            "description": properties.get('Description', ''),
            "load_state": properties.get('LoadState', ''),
            "active_state": properties.get('ActiveState', ''),
            "sub_state": properties.get('SubState', ''),
            "enabled": properties.get('UnitFileState') == 'enabled',
            "main_pid": properties.get('MainPID', '0'),
            "memory_current": properties.get('MemoryCurrent', '0'),
            "cpu_usage": properties.get('CPUUsageNSec', '0'),
            "recent_logs": logs_result.stdout.strip().split('\n') if logs_result.returncode == 0 else []
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get service info: {e}")

@router.post("/{service_name}/{action}")
async def service_action(
    service_name: str,
    action: str,
    current_user: User = Depends(get_admin_user)
):
    """Perform action on a service (start, stop, restart, enable, disable)"""
    valid_actions = ['start', 'stop', 'restart', 'reload', 'enable', 'disable', 'status']
    
    if action not in valid_actions:
        raise HTTPException(status_code=400, detail=f"Invalid action. Valid actions: {', '.join(valid_actions)}")
    
    try:
        result = subprocess.run(
            ['systemctl', action, service_name],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            return {
                "message": f"Service {service_name} {action} completed successfully",
                "service": service_name,
                "action": action,
                "success": True
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to {action} service: {result.stderr}"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to {action} service: {e}")

@router.get("/{service_name}/logs")
async def get_service_logs(
    service_name: str,
    lines: int = 100,
    since: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get service logs"""
    try:
        cmd = ['journalctl', '-u', service_name, '-n', str(lines), '--no-pager']
        if since:
            cmd.extend(['--since', since])
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            return {
                "service": service_name,
                "logs": result.stdout.strip().split('\n'),
                "lines": lines
            }
        else:
            raise HTTPException(status_code=400, detail=f"Failed to get logs: {result.stderr}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get service logs: {e}")