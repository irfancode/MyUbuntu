import React from 'react';
import styled from 'styled-components';
import {
  Search,
  Bell,
  User,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const HeaderContainer = styled.header`
  height: 60px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 10px;
  padding: 8px 16px;
  width: 320px;

  svg {
    color: #86868b;
    margin-right: 8px;
  }

  input {
    border: none;
    background: transparent;
    outline: none;
    font-size: 14px;
    width: 100%;
    color: #1d1d1f;

    &::placeholder {
      color: #86868b;
    }
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1d1d1f;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;

  span {
    font-size: 13px;
    font-weight: 600;
    color: #1d1d1f;
  }

  small {
    font-size: 11px;
    color: #86868b;
  }
`;

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <HeaderContainer>
      <SearchContainer>
        <Search size={18} />
        <input type="text" placeholder="Search anything..." />
      </SearchContainer>

      <ActionsContainer>
        <IconButton>
          <Bell size={20} />
        </IconButton>

        <UserProfile>
          <Avatar>
            <User size={18} />
          </Avatar>
          <UserInfo>
            <span>{user?.username || 'Admin'}</span>
            <small>{user?.is_admin ? 'Administrator' : 'User'}</small>
          </UserInfo>
        </UserProfile>

        <IconButton onClick={logout} title="Logout">
          <LogOut size={20} />
        </IconButton>
      </ActionsContainer>
    </HeaderContainer>
  );
};

export default Header;