import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Rocket, CheckCircle, ArrowRight, Download, Settings,
  Monitor, Wifi, Printer, Music, Shield, Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const WelcomeHeader = styled.div`
  text-align: center;
  margin-bottom: 48px;
  padding: 48px 0;
  
  .icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    color: white;
    box-shadow: 0 8px 32px rgba(0, 122, 255, 0.3);
  }
  
  h1 {
    font-size: 36px;
    font-weight: 700;
    color: #1d1d1f;
    margin-bottom: 12px;
  }
  
  p {
    font-size: 18px;
    color: #86868b;
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const ProgressBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 48px;
  
  .step {
    flex: 1;
    height: 4px;
    background: ${props => props.active ? '#007AFF' : 'rgba(0, 0, 0, 0.1)'};
    border-radius: 2px;
    transition: all 0.3s ease;
  }
`;

const SetupCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const OptionCard = styled.button`
  padding: 24px;
  background: ${props => props.$selected ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 0, 0, 0.02)'};
  border: 2px solid ${props => props.$selected ? '#007AFF' : 'transparent'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    background: ${props => props.$selected ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'};
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: ${props => props.$selected ? '#007AFF' : 'white'};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    color: ${props => props.$selected ? 'white' : '#007AFF'};
  }
  
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
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
`;

const Button = styled.button`
  padding: 14px 28px;
  background: ${props => props.$primary ? '#007AFF' : 'transparent'};
  color: ${props => props.$primary ? 'white' : '#007AFF'};
  border: ${props => props.$primary ? 'none' : '1px solid #007AFF'};
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    ${props => props.$primary && 'box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);'}
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CompleteScreen = styled.div`
  text-align: center;
  padding: 48px;
  
  .success-icon {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #34C759 0%, #30B0C7 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 32px;
    color: white;
    box-shadow: 0 8px 32px rgba(52, 199, 89, 0.3);
    animation: scaleIn 0.5s ease;
  }
  
  @keyframes scaleIn {
    0% { transform: scale(0); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  h2 {
    font-size: 32px;
    font-weight: 700;
    color: #1d1d1f;
    margin-bottom: 16px;
  }
  
  p {
    font-size: 16px;
    color: #86868b;
    margin-bottom: 32px;
  }
`;

const GettingStarted: React.FC = () => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    theme: 'light',
    browser: 'chrome',
    editor: 'vscode',
    apps: []
  });

  const steps = [
    { id: 1, title: 'Welcome' },
    { id: 2, title: 'Appearance' },
    { id: 3, title: 'Apps' },
    { id: 4, title: 'Complete' }
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    toast.success('Welcome to Ubuntu! Setup complete!');
  };

  return (
    <Container>
      <WelcomeHeader>
        <div className="icon">
          <Rocket size={40} />
        </div>
        <h1>Welcome to Ubuntu!</h1>
        <p>Let's set up your system to make it work exactly how you want. This will only take a minute.</p>
      </WelcomeHeader>

      <ProgressBar>
        {steps.map((s, idx) => (
          <div 
            key={s.id} 
            className="step" 
            active={idx + 1 <= step ? 'true' : undefined}
          />
        ))}
      </ProgressBar>

      {step === 1 && (
        <SetupCard>
          <h2>
            <Sparkles size={24} color="#FF9500" />
            Choose Your Style
          </h2>
          <p style={{ color: '#86868b', marginBottom: '24px' }}>
            Select the look that feels most comfortable to you
          </p>
          
          <OptionGrid>
            <OptionCard 
              $selected={preferences.theme === 'light'}
              onClick={() => setPreferences({...preferences, theme: 'light'})}
            >
              <div className="icon">
                <Monitor size={24} />
              </div>
              <h4>Light Mode</h4>
              <p>Clean and bright</p>
            </OptionCard>
            
            <OptionCard 
              $selected={preferences.theme === 'dark'}
              onClick={() => setPreferences({...preferences, theme: 'dark'})}
            >
              <div className="icon">
                <Monitor size={24} />
              </div>
              <h4>Dark Mode</h4>
              <p>Easy on the eyes</p>
            </OptionCard>
            
            <OptionCard 
              $selected={preferences.theme === 'auto'}
              onClick={() => setPreferences({...preferences, theme: 'auto'})}
            >
              <div className="icon">
                <Settings size={24} />
              </div>
              <h4>Auto</h4>
              <p>Match system</p>
            </OptionCard>
          </OptionGrid>

          <NavigationButtons>
            <Button disabled>Back</Button>
            <Button $primary onClick={handleNext}>
              Continue <ArrowRight size={18} />
            </Button>
          </NavigationButtons>
        </SetupCard>
      )}

      {step === 2 && (
        <SetupCard>
          <h2>
            <Download size={24} color="#007AFF" />
            Essential Apps
          </h2>
          <p style={{ color: '#86868b', marginBottom: '24px' }}>
            Choose apps you want to install right away
          </p>
          
          <OptionGrid>
            {[
              { id: 'chrome', name: 'Google Chrome', icon: '🌐', desc: 'Web browser' },
              { id: 'vscode', name: 'VS Code', icon: '💻', desc: 'Code editor' },
              { id: 'spotify', name: 'Spotify', icon: '🎵', desc: 'Music streaming' },
              { id: 'discord', name: 'Discord', icon: '💬', desc: 'Chat app' },
              { id: 'steam', name: 'Steam', icon: '🎮', desc: 'Gaming platform' },
              { id: 'zoom', name: 'Zoom', icon: '📹', desc: 'Video calls' },
            ].map(app => (
              <OptionCard 
                key={app.id}
                $selected={preferences.apps.includes(app.id)}
                onClick={() => {
                  const newApps = preferences.apps.includes(app.id)
                    ? preferences.apps.filter(a => a !== app.id)
                    : [...preferences.apps, app.id];
                  setPreferences({...preferences, apps: newApps});
                }}
              >
                <div className="icon" style={{ fontSize: '24px' }}>
                  {app.icon}
                </div>
                <h4>{app.name}</h4>
                <p>{app.desc}</p>
              </OptionCard>
            ))}
          </OptionGrid>

          <NavigationButtons>
            <Button onClick={handleBack}>Back</Button>
            <Button $primary onClick={handleNext}>
              Continue <ArrowRight size={18} />
            </Button>
          </NavigationButtons>
        </SetupCard>
      )}

      {step === 3 && (
        <SetupCard>
          <h2>
            <Shield size={24} color="#34C759" />
            Privacy & Security
          </h2>
          <p style={{ color: '#86868b', marginBottom: '24px' }}>
            Configure your privacy settings
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { name: 'Location Services', desc: 'Allow apps to access your location', enabled: true },
              { name: 'Automatic Updates', desc: 'Keep your system secure', enabled: true },
              { name: 'Usage Analytics', desc: 'Help improve Ubuntu', enabled: false },
              { name: 'Firewall', desc: 'Protect your system', enabled: true },
            ].map((setting, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '12px'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1d1d1f', marginBottom: '4px' }}>
                    {setting.name}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#86868b' }}>{setting.desc}</p>
                </div>
                <div 
                  style={{
                    width: '52px',
                    height: '32px',
                    background: setting.enabled ? '#34C759' : '#E5E5EA',
                    borderRadius: '16px',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  <div 
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: setting.enabled ? '26px' : '2px',
                      width: '28px',
                      height: '28px',
                      background: 'white',
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <NavigationButtons>
            <Button onClick={handleBack}>Back</Button>
            <Button $primary onClick={handleNext}>
              Complete Setup <CheckCircle size={18} />
            </Button>
          </NavigationButtons>
        </SetupCard>
      )}

      {step === 4 && (
        <CompleteScreen>
          <div className="success-icon">
            <CheckCircle size={50} />
          </div>
          <h2>You're All Set!</h2>
          <p>Your Ubuntu system is now configured and ready to use. Enjoy your new experience!</p>
          <Button $primary onClick={handleFinish} style={{ margin: '0 auto' }}>
            Get Started <Rocket size={18} />
          </Button>
        </CompleteScreen>
      )}
    </Container>
  );
};

export default GettingStarted;