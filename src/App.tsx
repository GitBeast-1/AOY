import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProvenNichesView } from './components/ProvenNichesView';
import { HomeView } from './components/HomeView';
import { ResearchView } from './components/ResearchView';
import { IdeasView } from './components/IdeasView';
import { CompetitorsView } from './components/CompetitorsView';
import { ThumbsView } from './components/ThumbsView';
import { CourseView } from './components/CourseView';
import { MyChannelView } from './components/MyChannelView';
import { MyNotesView } from './components/MyNotesView';
import { MyReportsView } from './components/MyReportsView';
import { SettingsView } from './components/SettingsView';
import { ChannelModal } from './components/ChannelModal';
import { ConnectorsModal } from './components/ConnectorsModal';
import { ProvenChannel, WorkspaceData, NicheIdea, CreatorNote, SavedThumbnail } from './types';
import { api } from './services/api';

export default function App() {
  // Navigation State - default to 'proven-niches' matching the user's screenshots!
  const [activeTab, setActiveTab] = useState<string>('proven-niches');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aoy_theme');
      if (saved) return saved === 'dark';
    } catch (e) {}
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      try {
        localStorage.setItem('aoy_theme', 'dark');
      } catch (e) {}
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      try {
        localStorage.setItem('aoy_theme', 'light');
      } catch (e) {}
    }
  }, [isDarkMode]);

  // Data State
  const [channels, setChannels] = useState<ProvenChannel[]>([]);
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [selectedChannel, setSelectedChannel] = useState<ProvenChannel | null>(null);
  const [isConnectorsOpen, setIsConnectorsOpen] = useState(false);

  // Fetch Channels
  const fetchChannels = useCallback(async () => {
    try {
      const data = await api.getChannels();
      setChannels(data.channels || []);
    } catch (err) {
      console.error('Failed to load channels:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Workspace
  const fetchWorkspace = useCallback(async () => {
    try {
      const data = await api.getWorkspace();
      setWorkspace(data);
    } catch (err) {
      console.error('Failed to load workspace:', err);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
    fetchWorkspace();

    // Immediate sync on tab focus or visibility change
    const onFocus = () => {
      fetchWorkspace();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') fetchWorkspace();
    });

    // Background sync polling (faster when user is on thumbs tab)
    const interval = setInterval(() => {
      fetchWorkspace();
    }, activeTab === 'thumbs' ? 4000 : 15000);

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [fetchChannels, fetchWorkspace, activeTab]);

  // Handle Channel Save / Bookmark
  const handleToggleBookmark = async (channelId: string) => {
    // Optimistic UI update
    setWorkspace(prev => {
      if (!prev) return null;
      const exists = prev.bookmarkedChannelIds.includes(channelId);
      return {
        ...prev,
        bookmarkedChannelIds: exists
          ? prev.bookmarkedChannelIds.filter(id => id !== channelId)
          : [...prev.bookmarkedChannelIds, channelId],
        updatedAt: Date.now()
      };
    });

    try {
      const res = await api.toggleSaveChannel(channelId);
      setWorkspace(prev => prev ? { ...prev, bookmarkedChannelIds: res.savedIds } : null);
      // update in channel list
      setChannels(prev => prev.map(c => c.id === channelId ? { ...c, isBookmarked: res.isBookmarked } : c));
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  // Handle Channel Like
  const handleToggleLike = async (channelId: string) => {
    try {
      const res = await api.toggleLikeChannel(channelId);
      setWorkspace(prev => {
        if (!prev) return null;
        return {
          ...prev,
          likedChannelIds: res.isLiked
            ? [...prev.likedChannelIds, channelId]
            : prev.likedChannelIds.filter(id => id !== channelId)
        };
      });
      setChannels(prev => prev.map(c => c.id === channelId ? { ...c, isLiked: res.isLiked, likes: res.likes } : c));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  // Handle Save Idea
  const handleSaveIdea = async (idea: Partial<NicheIdea>) => {
    try {
      const updatedIdeas = await api.saveIdea('creator-prime', idea);
      setWorkspace(prev => prev ? { ...prev, ideas: updatedIdeas } : null);
    } catch (err) {
      console.error('Failed to save idea:', err);
    }
  };

  // Handle Delete Idea
  const handleDeleteIdea = async (ideaId: string) => {
    try {
      const updatedIdeas = await api.deleteIdea('creator-prime', ideaId);
      setWorkspace(prev => prev ? { ...prev, ideas: updatedIdeas } : null);
    } catch (err) {
      console.error('Failed to delete idea:', err);
    }
  };

  // Handle Save Note
  const handleSaveNote = async (note: Partial<CreatorNote>) => {
    try {
      const updatedNotes = await api.saveNote('creator-prime', note);
      setWorkspace(prev => prev ? { ...prev, notes: updatedNotes } : null);
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  // Handle Delete Note
  const handleDeleteNote = async (noteId: string) => {
    try {
      const updatedNotes = await api.deleteNote('creator-prime', noteId);
      setWorkspace(prev => prev ? { ...prev, notes: updatedNotes } : null);
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  // Handle Save Thumbnail
  const handleSaveThumbnail = async (thumbnail: Partial<SavedThumbnail>) => {
    try {
      const res = await api.saveThumbnail('creator-prime', thumbnail);
      setWorkspace(prev => prev ? {
        ...prev,
        savedThumbnails: res.savedThumbnails,
        activePreviewThumbIds: res.activePreviewThumbIds
      } : null);
    } catch (err) {
      console.error('Failed to save thumbnail:', err);
    }
  };

  // Handle Delete Thumbnail
  const handleDeleteThumbnail = async (thumbnailId: string) => {
    try {
      const res = await api.deleteThumbnail('creator-prime', thumbnailId);
      setWorkspace(prev => prev ? {
        ...prev,
        savedThumbnails: res.savedThumbnails,
        activePreviewThumbIds: res.activePreviewThumbIds
      } : null);
    } catch (err) {
      console.error('Failed to delete thumbnail:', err);
    }
  };

  // Handle Update Preview Slots (3 Active Large Thumbnails)
  const handleUpdatePreviewSlots = async (activeIds: string[]) => {
    try {
      const res = await api.setPreviewSlots('creator-prime', activeIds);
      setWorkspace(prev => prev ? {
        ...prev,
        activePreviewThumbIds: res.activePreviewThumbIds
      } : null);
    } catch (err) {
      console.error('Failed to update preview slots:', err);
    }
  };

  // Handle Import Thumbnail from YouTube or Extension
  const handleImportThumbnail = async (payload: any) => {
    try {
      const res = await api.importThumbnail({ ...payload, workspaceId: 'creator-prime' });
      await fetchWorkspace();
      return res;
    } catch (err) {
      console.error('Failed to import thumbnail:', err);
      throw err;
    }
  };

  // Handle Delete Channel
  const handleDeleteChannel = async (channelId: string) => {
    try {
      // Optimistic update
      setChannels(prev => prev.filter(c => c.id !== channelId));
      if (selectedChannel?.id === channelId) {
        setSelectedChannel(null);
      }
      setWorkspace(prev => {
        if (!prev) return null;
        return {
          ...prev,
          bookmarkedChannelIds: prev.bookmarkedChannelIds.filter(id => id !== channelId),
          likedChannelIds: prev.likedChannelIds.filter(id => id !== channelId)
        };
      });

      await api.deleteChannel(channelId);
    } catch (err) {
      console.error('Failed to delete channel:', err);
      // Refresh channels if deletion failed
      fetchChannels();
    }
  };

  // Handle Add / Discovered Channels
  const handleAddChannel = (channel: ProvenChannel) => {
    setChannels(prev => [channel, ...prev.filter(c => c.id !== channel.id)]);
  };

  const handleChannelsDiscovered = (newChannels: ProvenChannel[]) => {
    setChannels(prev => {
      const newIds = new Set(newChannels.map(c => c.id));
      return [...newChannels, ...prev.filter(c => !newIds.has(c.id))];
    });
  };

  const savedCount = workspace?.bookmarkedChannelIds.length || 60;

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-[#0b0c10] text-[#e2e8f0]' : 'bg-[#f4f5f8] text-[#1a1a1a]'} selection:bg-amber-500 selection:text-black font-sans`}>
      {/* Sidebar matching the Art OF YouTube (AOY) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenConnectors={() => setIsConnectorsOpen(true)}
        savedCount={savedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'proven-niches' && (
            <ProvenNichesView
              channels={channels}
              savedCount={savedCount}
              bookmarkedIds={workspace?.bookmarkedChannelIds || []}
              likedIds={workspace?.likedChannelIds || []}
              onToggleBookmark={handleToggleBookmark}
              onToggleLike={handleToggleLike}
              onSelectChannel={(ch) => setSelectedChannel(ch)}
              onHuntNiche={(ch) => setSelectedChannel(ch)}
              onDeleteChannel={handleDeleteChannel}
              onAddChannel={handleAddChannel}
              onChannelsDiscovered={handleChannelsDiscovered}
            />
          )}

          {activeTab === 'home' && (
            <HomeView
              channels={channels}
              onNavigateToProvenNiches={() => setActiveTab('proven-niches')}
              onSelectChannel={(ch) => setSelectedChannel(ch)}
              onHuntNiche={(ch) => setSelectedChannel(ch)}
            />
          )}

          {activeTab === 'research' && (
            <ResearchView 
              onSaveIdea={handleSaveIdea}
              onSaveThumbnail={handleSaveThumbnail}
              onNavigateToSettings={() => setActiveTab('settings')}
            />
          )}

          {activeTab === 'ideas' && (
            <IdeasView
              ideas={workspace?.ideas || []}
              onSaveIdea={handleSaveIdea}
              onDeleteIdea={handleDeleteIdea}
            />
          )}

          {activeTab === 'competitors' && (
            <CompetitorsView
              channels={channels}
              onSelectChannel={(ch) => setSelectedChannel(ch)}
            />
          )}

          {activeTab === 'thumbs' && (
            <ThumbsView 
              channels={channels}
              savedThumbnails={workspace?.savedThumbnails || []}
              activePreviewIds={workspace?.activePreviewThumbIds || []}
              onSaveThumbnail={handleSaveThumbnail}
              onDeleteThumbnail={handleDeleteThumbnail}
              onUpdatePreviewSlots={handleUpdatePreviewSlots}
              onImportThumbnail={handleImportThumbnail}
            />
          )}

          {activeTab === 'course' && (
            <CourseView />
          )}

          {activeTab === 'my-channel' && (
            <MyChannelView myChannel={workspace?.myChannel || {
              name: 'Tim | Faceless Studio',
              handle: '@timfaceless',
              niche: 'Animals & Nature History',
              subscribers: 14200,
              monthlyViews: 480000,
              rpm: 16.5,
              goalSubs: 100000
            }} />
          )}

          {activeTab === 'my-notes' && (
            <MyNotesView
              notes={workspace?.notes || []}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {activeTab === 'my-reports' && (
            <MyReportsView channels={channels} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onChannelsDiscovered={handleChannelsDiscovered}
              onNavigateToProvenNiches={() => setActiveTab('proven-niches')}
            />
          )}
        </div>
      </main>

      {/* Channel Modal matching Screenshot 4 & 4-1 */}
      <ChannelModal
        channel={selectedChannel}
        isOpen={Boolean(selectedChannel)}
        onClose={() => setSelectedChannel(null)}
        isBookmarked={Boolean(selectedChannel && (workspace?.bookmarkedChannelIds.includes(selectedChannel.id) || selectedChannel.isBookmarked))}
        isLiked={Boolean(selectedChannel && (workspace?.likedChannelIds.includes(selectedChannel.id) || selectedChannel.isLiked))}
        onToggleBookmark={handleToggleBookmark}
        onToggleLike={handleToggleLike}
        onSaveIdea={handleSaveIdea}
        onDeleteChannel={handleDeleteChannel}
      />

      {/* Connectors / MCP Modal matching Screenshot 2 */}
      <ConnectorsModal
        isOpen={isConnectorsOpen}
        onClose={() => setIsConnectorsOpen(false)}
      />
    </div>
  );
}
