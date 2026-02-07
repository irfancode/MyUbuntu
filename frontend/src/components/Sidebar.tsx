import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Settings,
  Network,
  HardDrive,
  Activity,
  Bell,
  Users,
  FileText,
  Shield,
  ChevronRight,
  Package,
  Monitor,
  Cpu,
  Folder,
  Zap,
} from 'lucide-react';

const SidebarContainer = styled.aside`
  width: 260px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
`;

const Logo = styled.div`
  padding: 0 20px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const LogoText = styled.div`
  h1 {
    font-size: 16px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0;
  }
  p {
    font-size: 12px;
    color: #86868b;
    margin: 0;
  }
`;

const Navigation = styled.nav`
  flex: 1;
  padding: 0 12px;
`;

const NavItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 4px;
  border: none;
  background: ${props => props.$active ? 'rgba(0, 122, 255, 0.1)' : 'transparent'};
  color: ${props => props.$active ? '#007AFF' : '#1d1d1f'};
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '400'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const SidebarFooter = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
`;

const menuItems = [
  // User-Friendly Section (Windows/Mac familiar)
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/apps', label: 'App Store', icon: Package },
  { path: '/files', label: 'Files', icon: Folder },
  { path: '/preferences', label: 'System Preferences', icon: Settings },
  { path: '/devices', label: 'Device Manager', icon: Monitor },
  { path: '/optimizer', label: 'Performance', icon: Zap },
  
  // Advanced Section
  { path: '/system', label: 'System Info', icon: Server },
  { path: '/services', label: 'Services', icon: Cpu },
  { path: '/network', label: 'Network', icon: Network },
  { path: '/storage', label: 'Storage', icon: HardDrive },
  { path: '/monitoring', label: 'Monitoring', icon: Activity },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/logs', label: 'Logs', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Shield },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarContainer>
      <Logo>
        <LogoIcon>
          <Server size={24} />
        </LogoIcon>
        <LogoText>
          <h1>Ubuntu Master</h1>
          <p>Control Center</p>
        </LogoText>
      </Logo>

      <Navigation>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavItem
              key={item.path}
              $active={isActive}
              onClick={() => navigate(item.path)}
            >
              <Icon />
              <span>{item.label}</span>
              {isActive && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
            </NavItem>
          );
        })}
      </Navigation>

      <SidebarFooter>
        <NavItem onClick={() => navigate('/settings')}>
          <Settings size={20} />
          <span>System Settings</span>
        </NavItem>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;