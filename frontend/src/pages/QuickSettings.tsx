import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Monitor, Wifi, Volume2, Bluetooth, Battery, 
  Moon, Sun, Palette, Type, Grid, Image as ImageIcon,
  ChevronRight, Check
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

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
`;

const SettingsCard = styled.div`
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
    width: 40px;
    height: 40px;
    background: ${props => props.color || 'rgba(0, 122, 255, 0.1)'};
    border-radius: 10px;
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
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  
  &:last-child {
    border-bottom: none;
  }
  
  .info {
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
`;

const Toggle = styled.button<{ $active?: boolean }>`
  width: 52px;
  height: 32px;
  background: ${props => props.$active ? '#34C759' : '#E5E5EA'};
  border-radius: 16px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$active ? '26px' : '2px'};
    width: 28px;
    height: 28px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }
`;

const Slider = styled.input`
  width: 100%;
  height: 4px;
  background: #E5E5EA;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    cursor: pointer;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: white;
  font-size: 14px;
  color: #1d1d1f;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #007AFF;
  }
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
`;

const ThemeOption = styled.button<{ $active?: boolean; $bg: string }>`
  aspect-ratio: 16/10;
  background: ${props => props.$bg};
  border-radius: 8px;
  border: 2px solid ${props => props.$active ? '#007AFF' : 'transparent'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => props.$active && `
    &::after {
      content: '✓';
      color: ${props.$bg.includes('dark') ? 'white' : '#007AFF'};
      font-size: 20px;
      font-weight: bold;
    }
  `}
`;

const QuickSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    wifi: true,
    bluetooth: true,
    darkMode: false,
    nightShift: false,
    volume: 75,
    brightness: 80,
    theme: 'auto',
    accentColor: 'blue'
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`${key} ${!settings[key] ? 'enabled' : 'disabled'}`);
  };

  return (
    <Container>
      <PageHeader>
        <h1>
          <span>⚙️</span>
          System Preferences
        </h1>
        <p>Customize your Ubuntu experience - Mac/Windows style settings</p>
      </PageHeader>

      <SettingsGrid>
        <SettingsCard>
          <CardHeader color="#007AFF">
            <div className="icon">
              <Wifi size={20} />
            </div>
            <h3>Network & Connectivity</h3>
          </CardHeader>
          
          <SettingItem>
            <div className="info">
              <h4>Wi-Fi</h4>
              <p>Connected to Home_Network_5G</p>
            </div>
            <Toggle 
              $active={settings.wifi}
              onClick={() => toggleSetting('wifi')}
            />
          </SettingItem>

          <SettingItem>
            <div className="info">
              <h4>Bluetooth</h4>
              <p>2 devices connected</p>
            </div>
            <Toggle 
              $active={settings.bluetooth}
              onClick={() => toggleSetting('bluetooth')}
            />
          </SettingItem>

          <SettingItem>
            <div className="info">
              <h4>Airplane Mode</h4>
              <p>Disable all wireless connections</p>
            </div>
            <Toggle $active={false} />
          </SettingItem>
        </SettingsCard>

        <SettingsCard>
          <CardHeader color="#FF9500">
            <div className="icon">
              <Sun size={20} />
            </div>
            <h3>Display & Brightness</h3>
          </CardHeader>
          
          <SettingItem>
            <div className="info">
              <h4>Brightness</h4>
              <p>Adjust screen brightness</p>
            </div>
          </SettingItem>
          <Slider 
            type="range" 
            min="0" 
            max="100" 
            value={settings.brightness}
            onChange={(e) => setSettings({...settings, brightness: parseInt(e.target.value)})}
          />

          <SettingItem>
            <div className="info">
              <h4>Night Shift</h4>
              <p>Warm colors in the evening</p>
            </div>
            <Toggle 
              $active={settings.nightShift}
              onClick={() => toggleSetting('nightShift')}
            />
          </SettingItem>

          <SettingItem>
            <div className="info">
              <h4>True Tone</h4>
              <p>Automatically adapt display</p>
            </div>
            <Toggle $active={true} />
          </SettingItem>
        </SettingsCard>

        <SettingsCard>
          <CardHeader color="#5856D6">
            <div className="icon">
              <Palette size={20} />
            </div>
            <h3>Appearance</h3>
          </CardHeader>
          
          <SettingItem>
            <div className="info">
              <h4>Appearance</h4>
              <p>Choose your preferred look</p>
            </div>
          </SettingItem>
          <ThemeGrid>
            <ThemeOption 
              $bg="linear-gradient(135deg, #F5F5F7 0%, #FFFFFF 100%)"
              $active={!settings.darkMode}
              onClick={() => setSettings({...settings, darkMode: false})}
              title="Light"
            />
            <ThemeOption 
              $bg="linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)"
              $active={settings.darkMode}
              onClick={() => setSettings({...settings, darkMode: true})}
              title="Dark"
            />
            <ThemeOption 
              $bg="linear-gradient(135deg, #F5F5F7 50%, #1C1C1E 50%)"
              $active={settings.theme === 'auto'}
              onClick={() => setSettings({...settings, theme: 'auto'})}
              title="Auto"
            />
          </ThemeGrid>

          <SettingItem style={{ marginTop: '20px' }}>
            <div className="info">
              <h4>Accent Color</h4>
              <p>Used for buttons and highlights</p>
            </div>
          </SettingItem>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {['#007AFF', '#FF3B30', '#34C759', '#FF9500', '#AF52DE', '#FF2D55'].map(color => (
              <button
                key={color}
                onClick={() => setSettings({...settings, accentColor: color})}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: color,
                  border: settings.accentColor === color ? '3px solid #1d1d1f' : 'none',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </SettingsCard>

        <SettingsCard>
          <CardHeader color="#FF3B30">
            <div className="icon">
              <Volume2 size={20} />
            </div>
            <h3>Sound</h3>
          </CardHeader>
          
          <SettingItem>
            <div className="info">
              <h4>Output Volume</h4>
              <p>Adjust system volume</p>
            </div>
          </SettingItem>
          <Slider 
            type="range" 
            min="0" 
            max="100" 
            value={settings.volume}
            onChange={(e) => setSettings({...settings, volume: parseInt(e.target.value)})}
          />

          <SettingItem>
            <div className="info">
              <h4>Output Device</h4>
              <p>Select sound output</p>
            </div>
            <Select>
              <option>Built-in Speakers</option>
              <option>Headphones</option>
              <option>HDMI</option>
            </Select>
          </SettingItem>

          <SettingItem>
            <div className="info">
              <h4>Alert Sound</h4>
              <p>Choose notification sound</p>
            </div>
            <Select>
              <option>Default</option>
              <option>Bell</option>
              <option>Glass</option>
              <option>None</option>
            </Select>
          </SettingItem>
        </SettingsCard>

        <SettingsCard>
          <CardHeader color="#34C759">
            <div className="icon">
              <Battery size={20} />
            </div>
            <h3>Battery & Power</h3>
          </CardHeader>
          
          <SettingItem>
            <div className="info">
              <h4>Battery Percentage</h4>
              <p>Show in menu bar</p>
            </div>
            <Toggle $active={true} />
          </SettingItem>

          <SettingItem>
            <div className="info">
              <h4>Low Power Mode</h4>
              <p>Reduce power usage</p>
            </div>
            <Toggle $active={false} />
          </SettingItem>

          <SettingItem>
            <div className="info">
              <h4>Screen Timeout</h4>
              <p>Turn off display after</p>
            </div>
            <Select>
              <option>2 minutes</option>
              <option>5 minutes</option>
              <option>10 minutes</option>
              <option>Never</option>
            </Select>
          </SettingItem>
        </SettingsCard>

        <SettingsCard>
          <CardHeader color="#AF52DE">
            <div className="icon">
              <Moon size={20} />
            </div>
            <h3>Do Not Disturb</h3>
          </CardHeader>
          
          <SettingItem>
            <div className="info">
              <h4>Do Not Disturb</h4>
              <p>Silence notifications</p>
            </div>
            <Toggle $active={false} />
          </SettingItem>

          <SettingItem>
            <div className="info">
              <h4>Schedule</h4>
              <p>Turn on automatically</p>
            </div>
            <Toggle $active={true} />
          </SettingItem>

          <SettingItem>
            <div className="info">
              <h4>From - To</h4>
              <p>Set quiet hours</p>
            </div>
            <Select style={{ marginRight: '8px' }}>
              <option>10:00 PM</option>
            </Select>
            <Select>
              <option>7:00 AM</option>
            </Select>
          </SettingItem>
        </SettingsCard>
      </SettingsGrid>
    </Container>
  );
};

export default QuickSettings;