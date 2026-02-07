import React, { useState } from 'react';
import styled from 'styled-components';
import { Server, Lock, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Logo = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 32px;
  color: white;
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.3);
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #86868b;
  margin-bottom: 32px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #86868b;
    width: 20px;
    height: 20px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007AFF;
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
  }

  &::placeholder {
    color: #86868b;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0, 122, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecurityNote = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: #86868b;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        toast.error('Invalid username or password');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <Server size={40} />
        </Logo>
        <Title>Welcome Back</Title>
        <Subtitle>Sign in to Ubuntu Master Control</Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <User />
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <Lock />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>

        <SecurityNote>
          <Lock />
          <span>Secure connection enabled</span>
        </SecurityNote>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;