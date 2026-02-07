import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Folder, File, Image, FileText, Music, Video, 
  MoreVertical, Download, Trash2, Copy, Scissors, 
  Grid, List as ListIcon, Search, ArrowLeft, Home
} from 'lucide-react';
import { toast } from 'react-toastify';

const Container = styled.div``;

const PageHeader = styled.div`
  margin-bottom: 24px;
  h1 { 
    font-size: 28px; 
    font-weight: 700; 
    color: #1d1d1f; 
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  p { font-size: 14px; color: #86868b; }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  
  button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: transparent;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    color: #007AFF;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(0, 122, 255, 0.1);
    }
  }
  
  .separator {
    color: #86868b;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 4px;
  
  button {
    padding: 8px;
    background: ${props => props.active ? 'rgba(0, 122, 255, 0.1)' : 'transparent'};
    color: ${props => props.active ? '#007AFF' : '#86868b'};
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: ${props => props.active ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'};
    }
  }
`;

const FileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FileItem = styled.div`
  background: white;
  border-radius: ${props => props.$view === 'grid' ? '12px' : '8px'};
  padding: ${props => props.$view === 'grid' ? '16px' : '12px 16px'};
  border: 1px solid rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;
  display: ${props => props.$view === 'list' ? 'flex' : 'block'};
  align-items: ${props => props.$view === 'list' ? 'center' : 'initial'};
  gap: ${props => props.$view === 'list' ? '16px' : '0'};
  
  &:hover {
    background: rgba(0, 122, 255, 0.02);
    border-color: rgba(0, 122, 255, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  &.selected {
    background: rgba(0, 122, 255, 0.1);
    border-color: #007AFF;
  }
  
  .icon {
    width: ${props => props.$view === 'grid' ? '56px' : '40px'};
    height: ${props => props.$view === 'grid' ? '56px' : '40px'};
    background: ${props => props.color || 'rgba(0, 122, 255, 0.1)'};
    border-radius: ${props => props.$view === 'grid' ? '12px' : '8px'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.color ? 'white' : '#007AFF'};
    margin-bottom: ${props => props.$view === 'grid' ? '12px' : '0'};
    font-size: ${props => props.$view === 'grid' ? '24px' : '18px'};
  }
  
  .info {
    flex: 1;
    min-width: 0;
    
    h4 {
      font-size: 14px;
      font-weight: 500;
      color: #1d1d1f;
      margin-bottom: ${props => props.$view === 'grid' ? '4px' : '0'};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    p {
      font-size: 12px;
      color: #86868b;
      white-space: nowrap;
    }
  }
`;

const ContextMenu = styled.div`
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 180px;
  z-index: 100;
  
  .item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    font-size: 14px;
    color: #1d1d1f;
    cursor: pointer;
    transition: background 0.2s ease;
    
    &:hover {
      background: rgba(0, 122, 255, 0.1);
    }
    
    &.danger {
      color: #FF3B30;
    }
    
    svg {
      width: 16px;
      height: 16px;
      color: #86868b;
    }
  }
  
  .divider {
    height: 1px;
    background: rgba(0, 0, 0, 0.06);
    margin: 8px 0;
  }
`;

const sampleFiles = [
  { name: 'Documents', type: 'folder', size: '--', modified: 'Dec 15, 2024', icon: Folder, color: '#007AFF', color2: '#5856D6' },
  { name: 'Downloads', type: 'folder', size: '--', modified: 'Dec 14, 2024', icon: Folder, color: '#34C759', color2: '#30B0C7' },
  { name: 'Pictures', type: 'folder', size: '--', modified: 'Dec 13, 2024', icon: Folder, color: '#FF2D55', color2: '#FF6B9D' },
  { name: 'Music', type: 'folder', size: '--', modified: 'Dec 12, 2024', icon: Folder, color: '#AF52DE', color2: '#BF5AF2' },
  { name: 'Videos', type: 'folder', size: '--', modified: 'Dec 11, 2024', icon: Folder, color: '#FF9500', color2: '#FFCC00' },
  { name: 'Project.pdf', type: 'file', size: '2.4 MB', modified: 'Dec 10, 2024', icon: FileText, color: '#FF3B30' },
  { name: 'Vacation.jpg', type: 'file', size: '3.8 MB', modified: 'Dec 9, 2024', icon: Image, color: '#34C759' },
  { name: 'Playlist.mp3', type: 'file', size: '8.2 MB', modified: 'Dec 8, 2024', icon: Music, color: '#AF52DE' },
  { name: 'Movie.mp4', type: 'file', size: '1.2 GB', modified: 'Dec 7, 2024', icon: Video, color: '#FF9500' },
  { name: 'Notes.txt', type: 'file', size: '4 KB', modified: 'Dec 6, 2024', icon: File, color: '#86868b' },
];

const FileManager: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, file: any} | null>(null);

  const handleFileClick = (fileName: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileName) 
        ? prev.filter(f => f !== fileName)
        : [...prev, fileName]
    );
  };

  const handleRightClick = (e: React.MouseEvent, file: any) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, file });
  };

  const handleAction = (action: string) => {
    toast.success(`${action} ${contextMenu?.file?.name || 'files'}`);
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <Container>
      <PageHeader>
        <h1>
          <span>📁</span>
          Files
        </h1>
        <p>Browse and manage your files - Windows Explorer / Mac Finder style</p>
      </PageHeader>

      <Toolbar>
        <Breadcrumb>
          <button>
            <Home size={16} />
            Home
          </button>
          <span className="separator">/</span>
          <button>user</button>
          <span className="separator">/</span>
          <button style={{ color: '#1d1d1f', cursor: 'default' }}>Documents</button>
        </Breadcrumb>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#86868b' }} />
            <input 
              type="text" 
              placeholder="Search files..."
              style={{
                padding: '8px 12px 8px 32px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                fontSize: '14px',
                width: '200px'
              }}
            />
          </div>
          
          <ViewToggle active={viewMode}>
            <button 
              onClick={() => setViewMode('grid')}
              style={{ background: viewMode === 'grid' ? 'rgba(0, 122, 255, 0.1)' : 'transparent', color: viewMode === 'grid' ? '#007AFF' : '#86868b' }}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{ background: viewMode === 'list' ? 'rgba(0, 122, 255, 0.1)' : 'transparent', color: viewMode === 'list' ? '#007AFF' : '#86868b' }}
            >
              <ListIcon size={18} />
            </button>
          </ViewToggle>
        </div>
      </Toolbar>

      {viewMode === 'grid' ? (
        <FileGrid>
          {sampleFiles.map((file, idx) => {
            const Icon = file.icon;
            return (
              <FileItem 
                key={idx}
                $view="grid"
                color={file.color}
                className={selectedFiles.includes(file.name) ? 'selected' : ''}
                onClick={() => handleFileClick(file.name)}
                onContextMenu={(e) => handleRightClick(e, file)}
              >
                <div className="icon">
                  <Icon size={28} />
                </div>
                <div className="info">
                  <h4>{file.name}</h4>
                  <p>{file.size}</p>
                </div>
              </FileItem>
            );
          })}
        </FileGrid>
      ) : (
        <FileList>
          {sampleFiles.map((file, idx) => {
            const Icon = file.icon;
            return (
              <FileItem 
                key={idx}
                $view="list"
                color={file.color}
                className={selectedFiles.includes(file.name) ? 'selected' : ''}
                onClick={() => handleFileClick(file.name)}
                onContextMenu={(e) => handleRightClick(e, file)}
              >
                <div className="icon">
                  <Icon size={20} />
                </div>
                <div className="info" style={{ flex: 2 }}>
                  <h4>{file.name}</h4>
                </div>
                <div className="info" style={{ flex: 1 }}>
                  <p>{file.modified}</p>
                </div>
                <div className="info" style={{ flex: 1 }}>
                  <p>{file.size}</p>
                </div>
              </FileItem>
            );
          })}
        </FileList>
      )}

      {contextMenu && (
        <ContextMenu style={{ left: contextMenu.x, top: contextMenu.y }}>
          <div className="item" onClick={() => handleAction('Open')}>
            <Folder size={16} /> Open
          </div>
          <div className="item" onClick={() => handleAction('Cut')}>
            <Scissors size={16} /> Cut
          </div>
          <div className="item" onClick={() => handleAction('Copy')}>
            <Copy size={16} /> Copy
          </div>
          <div className="item" onClick={() => handleAction('Download')}>
            <Download size={16} /> Download
          </div>
          <div className="divider" />
          <div className="item danger" onClick={() => handleAction('Delete')}>
            <Trash2 size={16} /> Delete
          </div>
        </ContextMenu>
      )}
    </Container>
  );
};

export default FileManager;