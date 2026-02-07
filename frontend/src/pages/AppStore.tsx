import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Download, Star, Grid, List, Check, ExternalLink } from 'lucide-react';
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

const SearchContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
`;

const SearchBox = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  
  svg {
    color: #86868b;
    margin-right: 12px;
  }
  
  input {
    border: none;
    background: transparent;
    outline: none;
    font-size: 15px;
    width: 100%;
    
    &::placeholder {
      color: #86868b;
    }
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  background: ${props => props.$active ? '#007AFF' : 'white'};
  color: ${props => props.$active ? 'white' : '#1d1d1f'};
  border: 1px solid ${props => props.$active ? '#007AFF' : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? '#007AFF' : 'rgba(0, 122, 255, 0.1)'};
    color: ${props => props.$active ? 'white' : '#007AFF'};
  }
`;

const AppGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const AppCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
`;

const AppIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, ${props => props.color || '#007AFF'} 0%, ${props => props.color2 || '#5856D6'} 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 16px;
`;

const AppName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
`;

const AppDescription = styled.p`
  font-size: 13px;
  color: #86868b;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const AppMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #86868b;
  margin-bottom: 16px;
`;

const InstallButton = styled.button<{ $installed?: boolean }>`
  width: 100%;
  padding: 10px;
  background: ${props => props.$installed ? '#34C759' : '#007AFF'};
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const apps = [
  {
    id: 1,
    name: 'Visual Studio Code',
    description: 'Code editing. Redefined. Free, built on open source.',
    category: 'Development',
    rating: 4.8,
    downloads: '10M+',
    installed: true,
    icon: '📝',
    color: '#007ACC',
    color2: '#1E9EEB'
  },
  {
    id: 2,
    name: 'Spotify',
    description: 'Music for everyone. Stream millions of songs.',
    category: 'Entertainment',
    rating: 4.6,
    downloads: '50M+',
    installed: false,
    icon: '🎵',
    color: '#1DB954',
    color2: '#1ED760'
  },
  {
    id: 3,
    name: 'Discord',
    description: 'Your place to talk. Create a home for your communities.',
    category: 'Communication',
    rating: 4.7,
    downloads: '100M+',
    installed: true,
    icon: '💬',
    color: '#5865F2',
    color2: '#7289DA'
  },
  {
    id: 4,
    name: 'Steam',
    description: 'The ultimate destination for playing, discussing, and creating games.',
    category: 'Gaming',
    rating: 4.5,
    downloads: '50M+',
    installed: false,
    icon: '🎮',
    color: '#1b2838',
    color2: '#2a475e'
  },
  {
    id: 5,
    name: 'Zoom',
    description: 'Video conferencing, cloud phone, and webinars.',
    category: 'Productivity',
    rating: 4.4,
    downloads: '100M+',
    installed: false,
    icon: '📹',
    color: '#2D8CFF',
    color2: '#0B5CFF'
  },
  {
    id: 6,
    name: 'GIMP',
    description: 'GNU Image Manipulation Program. Free & open source image editor.',
    category: 'Graphics',
    rating: 4.3,
    downloads: '5M+',
    installed: false,
    icon: '🎨',
    color: '#5C5548',
    color2: '#716B5C'
  }
];

const categories = ['All', 'Development', 'Productivity', 'Entertainment', 'Graphics', 'Communication', 'Gaming', 'Utilities'];

const AppStore: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredApps = apps.filter(app => {
    const matchesCategory = activeCategory === 'All' || app.category === activeCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInstall = (appName: string) => {
    toast.success(`Installing ${appName}...`);
  };

  return (
    <Container>
      <PageHeader>
        <h1>
          <span>📦</span>
          App Store
        </h1>
        <p>Discover and install applications for your Ubuntu system</p>
      </PageHeader>

      <SearchContainer>
        <SearchBox>
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Search apps, games, utilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBox>
      </SearchContainer>

      <CategoryTabs>
        {categories.map(cat => (
          <Tab 
            key={cat} 
            $active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Tab>
        ))}
      </CategoryTabs>

      <AppGrid>
        {filteredApps.map(app => (
          <AppCard key={app.id}>
            <AppIcon color={app.color} color2={app.color2}>
              {app.icon}
            </AppIcon>
            <AppName>{app.name}</AppName>
            <AppDescription>{app.description}</AppDescription>
            <AppMeta>
              <span>⭐ {app.rating}</span>
              <span>•</span>
              <span>{app.downloads} downloads</span>
            </AppMeta>
            <InstallButton 
              $installed={app.installed}
              onClick={() => handleInstall(app.name)}
            >
              {app.installed ? (
                <><Check size={16} /> Installed</>
              ) : (
                <><Download size={16} /> Install</>
              )}
            </InstallButton>
          </AppCard>
        ))}
      </AppGrid>
    </Container>
  );
};

export default AppStore;