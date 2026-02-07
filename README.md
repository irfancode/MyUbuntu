# Ubuntu Master Control

A comprehensive, Apple-inspired web-based server management platform for Ubuntu Linux systems. Combines the best features of Webmin and Cockpit with a modern, intuitive interface that makes server management accessible to everyone - even those with no prior Linux experience.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

## Features

### Dashboard
- Real-time system metrics (CPU, Memory, Disk, Network)
- Beautiful charts and visualizations
- Quick actions panel
- System health monitoring
- Uptime tracking

### System Management
- System information overview
- Hostname and timezone configuration
- System restart/shutdown controls
- Cache management
- Kernel and OS information

### Services Management
- Start/stop/restart services
- Service status monitoring
- View service logs
- Auto-start configuration
- Service dependency visualization

### Network Management
- Network interface configuration
- IP address management
- Network usage monitoring
- Port scanning
- Firewall management (UFW)

### Storage Management
- Disk usage visualization
- Partition management
- LVM management
- RAID configuration
- SMART monitoring
- File browser

### User Management
- Create/modify/delete users
- Group management
- Password policies
- SSH key management
- Permission management

### Monitoring & Alerts
- Real-time metrics collection
- Custom alert rules
- Email/Slack/Discord notifications
- Historical data retention
- Performance graphs
- Export capabilities

### Backup & Recovery
- Automated backups
- Incremental backups
- Remote storage (S3, Azure, GCS)
- One-click restore
- Backup scheduling

### Docker Management
- Container management
- Image management
- Volume management
- Network configuration
- Compose support

### Database Management
- Support for MySQL, PostgreSQL, MongoDB, Redis
- Query editor
- User management
- Backup/restore
- Performance monitoring

### SSL Certificates
- Let's Encrypt integration
- Certificate management
- Auto-renewal
- Custom certificates

### Security
- Two-factor authentication
- Session management
- Audit logging
- Fail2ban integration
- Security scanning

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Ubuntu 20.04+ system (host)
- Root or sudo access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/irfancode/ubuntu-master-control.git
cd ubuntu-master-control
```

2. Configure environment variables (optional):
```bash
cp .env.example .env
# Edit .env file with your settings
```

3. Start the application:
```bash
docker-compose up -d
```

4. Access the web interface:
- Open your browser and navigate to `https://localhost:8443`
- Default credentials: 
  - Username: `admin`
  - Password: `changeme`
- **Important**: Change the default password immediately after first login!

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `UMC_ADMIN_USER` | Admin username | admin |
| `UMC_ADMIN_PASSWORD` | Admin password | changeme |
| `UMC_PORT` | HTTPS port | 8443 |
| `UMC_HTTP_PORT` | HTTP port | 8080 |
| `UMC_ENABLE_SSL` | Enable SSL/TLS | true |
| `UMC_TIMEZONE` | System timezone | UTC |
| `SMTP_HOST` | SMTP server for alerts | |
| `SMTP_PORT` | SMTP port | 587 |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | |
| `DISCORD_WEBHOOK_URL` | Discord webhook for notifications | |

## Architecture

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (with migration support)
- **Authentication**: JWT tokens with refresh mechanism
- **Real-time**: WebSocket for live updates
- **Monitoring**: Background async services
- **Task Scheduling**: APScheduler

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Styled-components
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Toastify

### Docker
- Multi-stage build for optimization
- Privileged container for full system access
- Volume mounting for persistence
- Health checks included

## Security Considerations

- Always use HTTPS in production
- Change default credentials immediately
- Use strong passwords
- Enable 2FA when available
- Regularly update the container
- Monitor audit logs
- Use firewall rules to restrict access

## Development

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

## API Documentation

API documentation is available at `/api/docs` when running in development mode.

## Monitoring Integrations

### Supported Tools
- Prometheus (metrics export)
- Grafana (dashboards)
- InfluxDB (time-series data)
- Elasticsearch (log aggregation)
- PagerDuty (alerting)

### Features
- CPU/Memory/Disk monitoring
- Network I/O tracking
- Process monitoring
- Service health checks
- Custom metrics
- Alert rules engine

## Backup Solutions

### Supported Destinations
- Local storage
- Amazon S3
- Google Cloud Storage
- Azure Blob Storage
- SFTP/FTP
- Rclone-compatible services

### Backup Types
- Full system backup
- Incremental backup
- Configuration backup
- Database backup
- File-level backup

## Troubleshooting

### Common Issues

1. **Cannot connect to Docker daemon**
   - Ensure user is in `docker` group
   - Run: `sudo usermod -aG docker $USER`

2. **Permission denied errors**
   - Check container privileges
   - Verify volume permissions

3. **Port conflicts**
   - Change ports in docker-compose.yml
   - Check for existing services

4. **Database locked errors**
   - Ensure single instance running
   - Check disk space

### Logs
```bash
# View application logs
docker logs umc-server

# View system logs
docker exec umc-server tail -f /var/log/umc/app.log
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Roadmap

- [ ] Kubernetes integration
- [ ] Mobile app
- [ ] Multi-server management
- [ ] Cloud provider integrations
- [ ] Ansible integration
- [ ] Custom plugin system
- [ ] REST API v2
- [ ] Webhook support

## License

MIT License - see LICENSE file for details

## Support

- GitHub Issues: https://github.com/irfancode/ubuntu-master-control/issues
- Documentation: https://docs.ubuntu-master-control.io
- Community Discord: [Link]

## Acknowledgments

- Inspired by Webmin, Cockpit, and Apple Design
- Built with FastAPI, React, and Docker
- Icons by Lucide
- Charts by Recharts

---

**Disclaimer**: This is a powerful tool that provides full system access. Use with caution and always test in a non-production environment first.