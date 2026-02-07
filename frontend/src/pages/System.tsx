import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Server, Power, RefreshCw, Clock, Globe, Shield } from 'lucide-react';
import { toast } from 'react-toastify';

const Container = styled.div``;

const PageHeader = styled.div`
  margin-bottom: 32px;
  h1 { font-size: 32px; font-weight: 700; color: #1d1d1f; margin-bottom: 8px; }
  p { font-size: 16px; color: #86868b; }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .label {
    font-size: 12px;
    color: #86868b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 15px;
    font-weight: 600;
    color: #1d1d1f;
  }
`;

const ActionButton = styled.button<{ $variant?: 'danger' | 'primary' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${props => props.$variant === 'danger' ? '#FF3B30' : '#007AFF'};
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 12px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${props => props.$variant === 'danger' ? 'rgba(255, 59, 48, 0.3)' : 'rgba(0, 122, 255, 0.3)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const System: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch('/api/system/info');
      const data = await response.json();
      setSystemInfo(data);
    } catch (error) {
      toast.error('Failed to fetch system information');
    }
  };

  const handleRestart = async () => {
    if (!window.confirm('Are you sure you want to restart the system?')) return;
    
    try {
      setLoading(true);
      await fetch('/api/system/restart', { method: 'POST' });
      toast.success('System restart initiated');
    } catch (error) {
      toast.error('Failed to restart system');
    } finally {
      setLoading(false);
    }
  };

  const handleShutdown = async () => {
    if (!window.confirm('Are you sure you want to shutdown the system?')) return;
    
    try {
      setLoading(true);
      await fetch('/api/system/shutdown', { method: 'POST' });
      toast.success('System shutdown initiated');
    } catch (error) {
      toast.error('Failed to shutdown system');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <PageHeader>
        <h1>System Management</h1>
        <p>Control and monitor your system</p>
      </PageHeader>

      <Card>
        <h3><Server size={20} /> System Information</h3>
        <InfoGrid>
          <InfoItem>
            <span className="label">Hostname</span>
            <span className="value">{systemInfo?.hostname || 'Loading...'}</span>
          </InfoItem>
          <InfoItem>
            <span className="label">Operating System</span>
            <span className="value">{systemInfo?.os?.name || 'Loading...'}</span>
          </InfoItem>
          <InfoItem>
            <span className="label">Kernel Version</span>
            <span className="value">{systemInfo?.kernel?.release || 'Loading...'}</span>
          </InfoItem>
          <InfoItem>
            <span className="label">Architecture</span>
            <span className="value">{systemInfo?.kernel?.machine || 'Loading...'}</span>
          </InfoItem>
          <InfoItem>
            <span className="label">Uptime</span>
            <span className="value">{systemInfo?.uptime?.formatted || 'Loading...'}</span>
          </InfoItem>
          <InfoItem>
            <span className="label">Timezone</span>
            <span className="value">{systemInfo?.timezone || 'Loading...'}</span>
          </InfoItem>
        </InfoGrid>
      </Card>

      <Card>
        <h3><Power size={20} /> Power Controls</h3>
        <ActionButton onClick={handleRestart} disabled={loading}>
          <RefreshCw size={16} /> Restart System
        </ActionButton>
        <ActionButton $variant="danger" onClick={handleShutdown} disabled={loading}>
          <Power size={16} /> Shutdown System
        </ActionButton>
      </Card>
    </Container>
  );
};

export default System;