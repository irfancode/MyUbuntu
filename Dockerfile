# Multi-stage build for Ubuntu Master Control
FROM node:20-alpine AS frontend-builder

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production

COPY frontend/ ./
RUN npm run build

# Backend stage
FROM python:3.11-slim-bookworm AS backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    net-tools \
    iputils-ping \
    dnsutils \
    htop \
    iotop \
    ncdu \
    tree \
    vim \
    nano \
    systemd \
    dbus \
    ufw \
    fail2ban \
    smartmontools \
    hdparm \
    nvme-cli \
    lsof \
    tcpdump \
    nmap \
    iptraf-ng \
    iftop \
    nethogs \
    vnstat \
    speedtest-cli \
    certbot \
    python3-certbot-nginx \
    cron \
    logrotate \
    rsyslog \
    sudo \
    sshpass \
    rsync \
    tar \
    gzip \
    bzip2 \
    xz-utils \
    zip \
    unzip \
    p7zip-full \
    parted \
    gparted \
    e2fsprogs \
    xfsprogs \
    btrfs-progs \
    ntfs-3g \
    exfat-fuse \
    dosfstools \
    mdadm \
    lvm2 \
    cryptsetup \
    open-iscsi \
    nfs-common \
    cifs-utils \
    samba \
    samba-common \
    apache2-utils \
    nginx \
    redis-tools \
    postgresql-client \
    mysql-client \
    mongodb-clients \
    sqlite3 \
    influxdb-client \
    prometheus-node-exporter \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

# Create necessary directories
RUN mkdir -p /app/data /app/logs /app/backups /app/config /app/monitoring

# Setup logging
RUN mkdir -p /var/log/umc && touch /var/log/umc/app.log /var/log/umc/error.log /var/log/umc/access.log

# Copy monitoring configs
COPY monitoring/ /app/monitoring/
COPY config/ /app/config/

# Create startup script
RUN cat > /app/start.sh << 'EOF'
#!/bin/bash
set -e

echo "Starting Ubuntu Master Control..."
echo "=================================="

# Setup environment
cd /app

# Create initial admin user if not exists
python3 backend/scripts/setup_admin.py

# Start monitoring daemon
python3 monitoring/monitoring_daemon.py &

# Start log aggregator
python3 backend/log_aggregator.py &

# Start backup scheduler
python3 backend/backup_scheduler.py &

# Start alert manager
python3 backend/alert_manager.py &

# Start main application
echo "Starting web interface on port ${UMC_PORT:-8443}..."
cd /app/backend && gunicorn \
    --bind 0.0.0.0:${UMC_PORT:-8443} \
    --workers 4 \
    --threads 2 \
    --worker-class uvicorn.workers.UvicornWorker \
    --access-logfile /var/log/umc/access.log \
    --error-logfile /var/log/umc/error.log \
    --log-level info \
    --timeout 120 \
    --keep-alive 5 \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    main:app
EOF

RUN chmod +x /app/start.sh

# Setup cron for scheduled tasks
COPY config/crontab /etc/cron.d/umc
RUN chmod 0644 /etc/cron.d/umc && crontab /etc/cron.d/umc

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Expose ports
EXPOSE 8443 8080

# Start the application
CMD ["/app/start.sh"]