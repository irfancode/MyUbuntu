from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    preferences = Column(JSON, default=dict)

class SystemMetric(Base):
    __tablename__ = "system_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    cpu_percent = Column(Float)
    cpu_count = Column(Integer)
    memory_percent = Column(Float)
    memory_used = Column(Integer)  # MB
    memory_total = Column(Integer)  # MB
    disk_percent = Column(Float)
    disk_used = Column(Integer)  # GB
    disk_total = Column(Integer)  # GB
    network_sent = Column(Integer)  # bytes
    network_recv = Column(Integer)  # bytes
    load_avg_1 = Column(Float)
    load_avg_5 = Column(Float)
    load_avg_15 = Column(Float)
    uptime_seconds = Column(Integer)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    severity = Column(String)  # info, warning, critical
    condition = Column(Text)  # JSON condition
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    triggered_at = Column(DateTime)
    resolved_at = Column(DateTime)
    notification_channels = Column(JSON, default=list)

class AlertHistory(Base):
    __tablename__ = "alert_history"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"))
    triggered_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)
    message = Column(Text)
    severity = Column(String)
    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String)
    acknowledged_at = Column(DateTime)

class Backup(Base):
    __tablename__ = "backups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)  # full, incremental, config
    source_path = Column(String)
    destination = Column(String)
    size_bytes = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    status = Column(String)  # pending, running, completed, failed
    error_message = Column(Text)
    retention_days = Column(Integer, default=30)

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    display_name = Column(String)
    description = Column(Text)
    enabled = Column(Boolean, default=True)
    auto_start = Column(Boolean, default=True)
    monitored = Column(Boolean, default=False)
    restart_on_failure = Column(Boolean, default=False)
    max_restarts = Column(Integer, default=3)
    restart_window = Column(Integer, default=300)  # seconds

class LogEntry(Base):
    __tablename__ = "log_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    level = Column(String)  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    source = Column(String)  # component name
    message = Column(Text)
    metadata = Column(JSON, default=dict)

class Setting(Base):
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(Text)
    category = Column(String)
    description = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Database engine and session
engine = create_engine(
    os.getenv("DATABASE_URL", "sqlite:///app/data/umc.db"),
    connect_args={"check_same_thread": False} if "sqlite" in os.getenv("DATABASE_URL", "") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

async def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()