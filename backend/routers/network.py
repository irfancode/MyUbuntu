from fastapi import APIRouter, Depends
from core.security import get_current_user

router = APIRouter()

@router.get("/interfaces")
async def get_network_interfaces(current_user = Depends(get_current_user)):
    """Get network interfaces"""
    import psutil
    interfaces = psutil.net_if_addrs()
    stats = psutil.net_if_stats()
    
    result = []
    for name, addrs in interfaces.items():
        iface_stats = stats.get(name)
        result.append({
            "name": name,
            "addresses": [
                {
                    "family": addr.family.name,
                    "address": addr.address,
                    "netmask": addr.netmask,
                    "broadcast": addr.broadcast
                }
                for addr in addrs
            ],
            "is_up": iface_stats.isup if iface_stats else False,
            "speed": iface_stats.speed if iface_stats else 0,
            "mtu": iface_stats.mtu if iface_stats else 0
        })
    
    return {"interfaces": result}

@router.get("/connections")
async def get_network_connections(current_user = Depends(get_current_user)):
    """Get active network connections"""
    import psutil
    connections = psutil.net_connections()
    
    return {
        "connections": [
            {
                "fd": conn.fd,
                "family": conn.family.name,
                "type": conn.type.name,
                "local_addr": conn.laddr,
                "remote_addr": conn.raddr if conn.raddr else None,
                "status": conn.status,
                "pid": conn.pid
            }
            for conn in connections[:100]  # Limit to 100 connections
        ],
        "total": len(connections)
    }

@router.get("/io")
async def get_network_io(current_user = Depends(get_current_user)):
    """Get network I/O statistics"""
    import psutil
    io = psutil.net_io_counters()
    
    return {
        "bytes_sent": io.bytes_sent,
        "bytes_recv": io.bytes_recv,
        "packets_sent": io.packets_sent,
        "packets_recv": io.packets_recv,
        "errin": io.errin,
        "errout": io.errout,
        "dropin": io.dropin,
        "dropout": io.dropout
    }