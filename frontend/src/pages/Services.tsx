import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Settings, Play, Square, RotateCw, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Container = styled.div``;

const PageHeader = styled.div`
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  h1 { font-size: 32px; font-weight: 700; color: #1d1d1f; }
`;

const ServiceGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const ServiceCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }
`;

const ServiceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  .icon {
    width: 48px;
    height: 48px;
    background: ${props => props.color || 'rgba(0, 122, 255, 0.1)'};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.color || '#007AFF'};
  }

  .details {
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #1d1d1f;
      margin-bottom: 4px;
    }

    p {
      font-size: 13px;
      color: #86868b;
    }
  }
`;

const StatusBadge = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => 
    props.$status === 'active' ? 'rgba(52, 199, 89, 0.1)' : 
    props.$status === 'inactive' ? 'rgba(255, 59, 48, 0.1)' : 
    'rgba(255, 149, 0, 0.1)'};
  color: ${props => 
    props.$status === 'active' ? '#34C759' : 
    props.$status === 'inactive' ? '#FF3B30' : 
    '#FF9500'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1d1d1f;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Services: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services/list');
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceAction = async (serviceName: string, action: string) => {
    try {
      await fetch(`/api/services/${serviceName}/${action}`, { method: 'POST' });
      toast.success(`${serviceName} ${action}ed successfully`);
      fetchServices();
    } catch (error) {
      toast.error(`Failed to ${action} ${serviceName}`);
    }
  };

  if (loading) {
    return <div>Loading services...</div>;
  }

  return (
    <Container>
      <PageHeader>
        <h1>Services</h1>
      </PageHeader>

      <ServiceGrid>
        {services.slice(0, 20).map((service) => (
          <ServiceCard key={service.name}>
            <ServiceInfo>
              <div className="icon">
                <Settings size={24} />
              </div>
              <div className="details">
                <h4>{service.name}</h4>
                <p>{service.description || 'System Service'}</p>
              </div>
            </ServiceInfo>

            <StatusBadge $status={service.active_state?.toLowerCase()}>
              {service.active_state === 'active' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {service.active_state}
            </StatusBadge>

            <ActionButtons>
              {service.active_state === 'active' ? (
                <IconButton 
                  onClick={() => handleServiceAction(service.name, 'stop')}
                  title="Stop"
                >
                  <Square size={18} />
                </IconButton>
              ) : (
                <IconButton 
                  onClick={() => handleServiceAction(service.name, 'start')}
                  title="Start"
                >
                  <Play size={18} />
                </IconButton>
              )}
              <IconButton 
                onClick={() => handleServiceAction(service.name, 'restart')}
                title="Restart"
              >
                <RotateCw size={18} />
              </IconButton>
            </ActionButtons>
          </ServiceCard>
        ))}
      </ServiceGrid>
    </Container>
  );
};

export default Services;