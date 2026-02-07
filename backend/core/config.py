from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # App settings
    APP_NAME: str = "Ubuntu Master Control"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("NODE_ENV") != "production"
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("UMC_PORT", 8443))
    HTTP_PORT: int = int(os.getenv("UMC_HTTP_PORT", 8080))
    
    # SSL settings
    ENABLE_SSL: bool = os.getenv("UMC_ENABLE_SSL", "true").lower() == "true"
    SSL_CERT_PATH: str = "/app/config/ssl/server.crt"
    SSL_KEY_PATH: str = "/app/config/ssl/server.key"
    
    # Security settings
    SECRET_KEY: str = os.getenv("UMC_SECRET_KEY", "your-secret-key-change-this")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = "sqlite:///app/data/umc.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Admin credentials
    ADMIN_USER: str = os.getenv("UMC_ADMIN_USER", "admin")
    ADMIN_PASSWORD: str = os.getenv("UMC_ADMIN_PASSWORD", "changeme")
    
    # Monitoring
    MONITORING_INTERVAL: int = 5  # seconds
    METRICS_RETENTION_DAYS: int = 30
    
    # Alerts
    ALERT_CHECK_INTERVAL: int = 60  # seconds
    MAX_ALERT_HISTORY: int = 1000
    
    # Backup
    BACKUP_RETENTION_DAYS: int = 30
    MAX_BACKUP_SIZE_GB: int = 100
    
    # Localization
    TIMEZONE: str = os.getenv("UMC_TIMEZONE", "UTC")
    LANGUAGE: str = os.getenv("UMC_LANGUAGE", "en")
    
    # Features
    ENABLE_DOCKER_MANAGEMENT: bool = True
    ENABLE_TERMINAL: bool = True
    ENABLE_FILE_MANAGER: bool = True
    ENABLE_SYSTEM_UPDATES: bool = True
    
    # Notification settings
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_TLS: bool = True
    
    # Slack webhook
    SLACK_WEBHOOK_URL: str = os.getenv("SLACK_WEBHOOK_URL", "")
    
    # Discord webhook
    DISCORD_WEBHOOK_URL: str = os.getenv("DISCORD_WEBHOOK_URL", "")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()