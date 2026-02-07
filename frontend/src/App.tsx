import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { useAuthStore } from './store/authStore';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import System from './pages/System';
import Services from './pages/Services';
import Network from './pages/Network';
import Storage from './pages/Storage';
import Monitoring from './pages/Monitoring';
import Alerts from './pages/Alerts';
import Users from './pages/Users';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import AppStore from './pages/AppStore';
import QuickSettings from './pages/QuickSettings';
import DeviceManager from './pages/DeviceManager';
import FileManager from './pages/FileManager';
import SystemOptimizer from './pages/SystemOptimizer';
import GettingStarted from './pages/GettingStarted';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background-color: #f5f5f7;
    color: #1d1d1f;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentArea = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: linear-gradient(180deg, #f5f5f7 0%, #ffffff 100%);
`;

function App() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <>
        <GlobalStyle />
        <Login />
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Sidebar />
        <MainContent>
          <Header />
          <ContentArea>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/system" element={<System />} />
              <Route path="/services" element={<Services />} />
              <Route path="/network" element={<Network />} />
              <Route path="/storage" element={<Storage />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/users" element={<Users />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/apps" element={<AppStore />} />
              <Route path="/preferences" element={<QuickSettings />} />
              <Route path="/devices" element={<DeviceManager />} />
              <Route path="/files" element={<FileManager />} />
              <Route path="/optimizer" element={<SystemOptimizer />} />
              <Route path="/welcome" element={<GettingStarted />} />
            </Routes>
          </ContentArea>
        </MainContent>
      </AppContainer>
    </>
  );
}

export default App;