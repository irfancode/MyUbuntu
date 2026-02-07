import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Zap, Trash2, Clock, RefreshCw, CheckCircle2,
  XCircle, ChevronRight, Shield, Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';

const Container = styled.div``;

const PageHeader = styled.div`
  margin-bottom: 32px;
  h1 { 
    font-size: 32px; 
    font-weight: 700; 
    color: #1d1d1f; 
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  p { font-size: 16px; color: #86868b; }
`;

const OptimizationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.06);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  
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
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1d1d1f;
  }
  
  p {
    font-size: 13px;
    color: #86868b;
  }
`;

const ScanButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #34C759 0%, #30B0C7 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
  margin-bottom: 24px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(52, 199, 89, 0.3);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  
  .value {
    font-size: 32px;
    font-weight: 700;
    color: #1d1d1f;
    margin-bottom: 4px;
  }
  
  .label {
    font-size: 13px;
    color: #86868b;
  }
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
  
  .icon {
    width: 40px;
    height: 40px;
    background: rgba(0, 122, 255, 0.1);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #007AFF;
  }
  
  .info {
    flex: 1;
    
    h4 {
      font-size: 15px;
      font-weight: 600;
      color: #1d1d1f;
      margin-bottom: 4px;
    }
    
    p {
      font-size: 13px;
      color: #86868b;
    }
  }
  
  .action {
    padding: 8px 16px;
    background: ${props => props.$done ? '#34C759' : '#007AFF'};
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    
    &:hover {
      opacity: 0.9;
    }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
  
  .fill {
    height: 100%;
    background: linear-gradient(90deg, #007AFF, #5856D6);
    border-radius: 4px;
    transition: width 0.3s ease;
  }
`;

const SystemOptimizer: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Clean System Cache', description: 'Free up 2.4 GB of space', icon: Trash2, done: false },
    { id: 2, name: 'Update Startup Programs', description: 'Disable 3 unnecessary apps', icon: Zap, done: false },
    { id: 3, name: 'Clear Browser Data', description: 'Cookies and temporary files', icon: RefreshCw, done: true },
    { id: 4, name: 'Scan for Malware', description: 'Last scan: 3 days ago', icon: Shield, done: false },
  ]);

  const handleScan = () => {
    setScanning(true);
    toast.info('Scanning your system...');
    setTimeout(() => {
      setScanning(false);
      toast.success('System scan complete! Found 4 optimization opportunities.');
    }, 3000);
  };

  const handleOptimize = (taskId: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, done: true } : task
    ));
    toast.success('Optimization complete!');
  };

  return (
    <Container>
      <PageHeader>
        <h1>
          <span>⚡</span>
          System Optimizer
        </h1>
        <p>Clean and speed up your system - One-click optimization like CCleaner</p>
      </PageHeader>

      <Card style={{ marginBottom: '24px' }}>
        <StatsGrid>
          <StatItem>
            <div className="value">78%</div>
            <div className="label">System Health</div>
            <ProgressBar>
              <div className="fill" style={{ width: '78%' }} />
            </ProgressBar>
          </StatItem>
          <StatItem>
            <div className="value">12.4 GB</div>
            <div className="label">Can be Freed</div>
          </StatItem>
          <StatItem>
            <div className="value">8</div>
            <div className="label">Issues Found</div>
          </StatItem>
        </StatsGrid>

        <ScanButton onClick={handleScan} disabled={scanning}>
          <Sparkles size={20} />
          {scanning ? 'Scanning...' : 'Scan & Optimize Now'}
        </ScanButton>
      </Card>

      <OptimizationGrid>
        <Card>
          <CardHeader color="#007AFF">
            <div className="icon">
              <Zap size={24} />
            </div>
            <div>
              <h3>Quick Optimizations</h3>
              <p>Recommended actions to improve performance</p>
            </div>
          </CardHeader>
          
          {tasks.map(task => {
            const Icon = task.icon;
            return (
              <TaskItem key={task.id} $done={task.done}>
                <div className="icon">
                  <Icon size={20} />
                </div>
                <div className="info">
                  <h4>{task.name}</h4>
                  <p>{task.description}</p>
                </div>
                <button 
                  className="action"
                  onClick={() => handleOptimize(task.id)}
                  disabled={task.done}
                >
                  {task.done ? (
                    <><CheckCircle2 size={16} /> Done</>
                  ) : (
                    'Optimize'
                  )}
                </button>
              </TaskItem>
            );
          })}
        </Card>

        <Card>
          <CardHeader color="#FF3B30">
            <div className="icon">
              <Clock size={24} />
            </div>
            <div>
              <h3>Startup Apps</h3>
              <p>Manage applications that start with your system</p>
            </div>
          </CardHeader>
          
          {[
            { name: 'Spotify', enabled: true, impact: 'High' },
            { name: 'Slack', enabled: true, impact: 'Medium' },
            { name: 'Docker Desktop', enabled: false, impact: 'High' },
            { name: 'Steam', enabled: false, impact: 'Low' },
          ].map((app, idx) => (
            <TaskItem key={idx} style={{ opacity: app.enabled ? 1 : 0.6 }}>
              <div className="info" style={{ flex: 1 }}>
                <h4>{app.name}</h4>
                <p>Impact: {app.impact}</p>
              </div>
              <button 
                className="action"
                style={{ background: app.enabled ? '#FF3B30' : '#34C759' }}
              >
                {app.enabled ? 'Disable' : 'Enable'}
              </button>
            </TaskItem>
          ))}
        </Card>
      </OptimizationGrid>
    </Container>
  );
};

export default SystemOptimizer;