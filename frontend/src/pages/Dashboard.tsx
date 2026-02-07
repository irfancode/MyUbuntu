import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Activity,
  Server,
  HardDrive,
  Network,
  Cpu,
  MemoryStick,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const DashboardContainer = styled.div`
  padding: 0;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;

  h1 {
    font-size: 32px;
    font-weight: 700;
    color: #1d1d1f;
    margin-bottom: 8px;
  }

  p {
    font-size: 16px;
    color: #86868b;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.cpu { background: linear-gradient(135deg, #FF3B30 0%, #FF9500 100%); }
    &.memory { background: linear-gradient(135deg, #5856D6 0%, #AF52DE 100%); }
    &.disk { background: linear-gradient(135deg, #34C759 0%, #30B0C7 100%); }
    &.network { background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%); }

    svg {
      color: white;
      width: 24px;
      height: 24px;
    }
  }

  .status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: ${props => props.color || '#34C759'};
  }
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #86868b;
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.06);

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 20px;
  }
`;

const SystemInfoCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.06);

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 20px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .icon {
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #86868b;
  }

  .content {
    .label {
      font-size: 12px;
      color: #86868b;
      margin-bottom: 2px;
    }

    .value {
      font-size: 14px;
      font-weight: 600;
      color: #1d1d1f;
    }
  }
`;

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch dashboard data
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/overview');
        const data = await response.json();
        setMetrics(data);
        
        if (data.metrics_history) {
          setChartData(data.metrics_history.map((m: any) => ({
            time: new Date(m.timestamp).toLocaleTimeString(),
            cpu: m.cpu || 0,
            memory: m.memory || 0,
            disk: m.disk || 0,
          })));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentMetrics = metrics?.current_metrics || {};

  return (
    <DashboardContainer>
      <PageHeader>
        <h1>Dashboard</h1>
        <p>Monitor your server's performance and health</p>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <div className="icon cpu">
              <Cpu />
            </div>
            <div className="status">
              <CheckCircle size={14} />
              Healthy
            </div>
          </StatHeader>
          <StatValue>{currentMetrics.cpu?.percent || 0}%</StatValue>
          <StatLabel>CPU Usage ({currentMetrics.cpu?.cores || 0} cores)</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <div className="icon memory">
              <MemoryStick />
            </div>
            <div className="status">
              <CheckCircle size={14} />
              Healthy
            </div>
          </StatHeader>
          <StatValue>{currentMetrics.memory?.percent || 0}%</StatValue>
          <StatLabel>Memory Usage ({currentMetrics.memory?.used_gb || 0} GB)</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <div className="icon disk">
              <HardDrive />
            </div>
            <div className="status">
              <CheckCircle size={14} />
              Healthy
            </div>
          </StatHeader>
          <StatValue>{currentMetrics.disk?.percent || 0}%</StatValue>
          <StatLabel>Disk Usage ({currentMetrics.disk?.used_gb || 0} GB)</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <div className="icon network">
              <Network />
            </div>
            <div className="status">
              <Activity size={14} />
              Active
            </div>
          </StatHeader>
          <StatValue>2.4 GB</StatValue>
          <StatLabel>Network Traffic (24h)</StatLabel>
        </StatCard>
      </StatsGrid>

      <ChartsContainer>
        <ChartCard>
          <h3>Resource Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FF3B30" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5856D6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#5856D6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{background: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
              />
              <Area type="monotone" dataKey="cpu" stroke="#FF3B30" fillOpacity={1} fill="url(#colorCpu)" name="CPU %" />
              <Area type="monotone" dataKey="memory" stroke="#5856D6" fillOpacity={1} fill="url(#colorMem)" name="Memory %" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <h3>System Load</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{background: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
              />
              <Line type="monotone" dataKey="disk" stroke="#34C759" strokeWidth={2} dot={false} name="Disk %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsContainer>

      <SystemInfoCard>
        <h3>System Information</h3>
        <InfoGrid>
          <InfoItem>
            <div className="icon">
              <Server size={20} />
            </div>
            <div className="content">
              <div className="label">Hostname</div>
              <div className="value">{metrics?.system_info?.hostname || 'Unknown'}</div>
            </div>
          </InfoItem>

          <InfoItem>
            <div className="icon">
              <Clock size={20} />
            </div>
            <div className="content">
              <div className="label">Uptime</div>
              <div className="value">{currentMetrics.uptime?.formatted || '0:00:00'}</div>
            </div>
          </InfoItem>

          <InfoItem>
            <div className="icon">
              <Activity size={20} />
            </div>
            <div className="content">
              <div className="label">Platform</div>
              <div className="value">{metrics?.system_info?.platform || 'Unknown'}</div>
            </div>
          </InfoItem>

          <InfoItem>
            <div className="icon">
              <AlertCircle size={20} />
            </div>
            <div className="content">
              <div className="label">Active Alerts</div>
              <div className="value">{metrics?.active_alerts || 0}</div>
            </div>
          </InfoItem>
        </InfoGrid>
      </SystemInfoCard>
    </DashboardContainer>
  );
};

export default Dashboard;