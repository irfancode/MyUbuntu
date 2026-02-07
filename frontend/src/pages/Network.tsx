import React from 'react';
import styled from 'styled-components';
import { Network, Wifi, Globe, Activity } from 'lucide-react';

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

const Network: React.FC = () => {
  return (
    <Container>
      <PageHeader>
        <h1>Network</h1>
        <p>Monitor and configure network settings</p>
      </PageHeader>

      <Card>
        <h3><Wifi size={20} /> Network Interfaces</h3>
        <p style={{ color: '#86868b' }}>Network interface information will be displayed here.</p>
      </Card>
    </Container>
  );
};

export default Network;