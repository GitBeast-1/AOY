import { ProvenChannel, WorkspaceData, NicheIdea, CreatorNote, SavedThumbnail, NicheHuntAnalysis, HunterSettings, HunterScanLog } from '../types';

export const api = {
  // Channels / Proven Niches
  async getChannels(params: {
    view?: string;
    style?: string;
    niche?: string;
    success?: string;
    complexity?: string;
    discovered?: string;
    likedOnly?: boolean;
    savedOnly?: boolean;
    search?: string;
    sort?: string;
  } = {}): Promise<{ channels: ProvenChannel[]; total: number; savedCount: number }> {
    const query = new URLSearchParams();
    if (params.view) query.set('view', params.view);
    if (params.style) query.set('style', params.style);
    if (params.niche) query.set('niche', params.niche);
    if (params.success) query.set('success', params.success);
    if (params.complexity) query.set('complexity', params.complexity);
    if (params.discovered) query.set('discovered', params.discovered);
    if (params.likedOnly) query.set('likedOnly', 'true');
    if (params.savedOnly) query.set('savedOnly', 'true');
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);

    const res = await fetch(`/api/channels?${query.toString()}`);
    return await res.json();
  },

  async getNiches(): Promise<{ success: boolean; total: number; niches: string[] }> {
    const res = await fetch('/api/niches');
    return await res.json();
  },

  async getChannel(id: string): Promise<ProvenChannel> {
    const res = await fetch(`/api/channels/${id}`);
    const data = await res.json();
    return data.channel;
  },

  async deleteChannel(id: string): Promise<{ success: boolean; deletedId: string; channelName: string; remainingCount: number }> {
    const res = await fetch(`/api/channels/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  async importYouTubeChannel(params: {
    query: string;
    niche?: string;
    style?: string;
    complexity?: string;
  }): Promise<{ success: boolean; channel: ProvenChannel; message?: string }> {
    const res = await fetch('/api/channels/import-youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await res.json();
  },

  async toggleSaveChannel(id: string, workspaceId?: string): Promise<{ isBookmarked: boolean; savedCount: number; savedIds: string[] }> {
    const res = await fetch(`/api/channels/${id}/toggle-save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId })
    });
    return await res.json();
  },

  async toggleLikeChannel(id: string, workspaceId?: string): Promise<{ isLiked: boolean; likes: number }> {
    const res = await fetch(`/api/channels/${id}/toggle-like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId })
    });
    return await res.json();
  },

  async huntNiche(id: string): Promise<NicheHuntAnalysis> {
    const res = await fetch(`/api/channels/${id}/hunt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return data.huntAnalysis;
  },

  // Autonomous Niche Hunter Engine
  async getHunterSettings(): Promise<{ success: boolean; settings: HunterSettings }> {
    const res = await fetch('/api/hunter/settings');
    return await res.json();
  },

  async updateHunterSettings(settings: Partial<HunterSettings>): Promise<{ success: boolean; settings: HunterSettings }> {
    const res = await fetch('/api/hunter/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return await res.json();
  },

  async runHunterScan(criteria?: any): Promise<{ success: boolean; addedChannels: ProvenChannel[]; scanLog: HunterScanLog }> {
    const res = await fetch('/api/hunter/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteria || {})
    });
    return await res.json();
  },

  // Workspace
  async getWorkspace(workspaceId?: string): Promise<WorkspaceData> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    const res = await fetch(`/api/workspace${query}`);
    const data = await res.json();
    return data.workspace;
  },

  async saveIdea(workspaceId: string, idea: Partial<NicheIdea>): Promise<NicheIdea[]> {
    const res = await fetch('/api/workspace/idea', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, idea })
    });
    const data = await res.json();
    return data.ideas;
  },

  async deleteIdea(workspaceId: string, ideaId: string): Promise<NicheIdea[]> {
    const res = await fetch(`/api/workspace/idea/${ideaId}?workspaceId=${encodeURIComponent(workspaceId)}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return data.ideas;
  },

  async saveNote(workspaceId: string, note: Partial<CreatorNote>): Promise<CreatorNote[]> {
    const res = await fetch('/api/workspace/note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, note })
    });
    const data = await res.json();
    return data.notes;
  },

  async deleteNote(workspaceId: string, noteId: string): Promise<CreatorNote[]> {
    const res = await fetch(`/api/workspace/note/${noteId}?workspaceId=${encodeURIComponent(workspaceId)}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return data.notes;
  },

  async saveThumbnail(workspaceId: string, thumbnail: Partial<SavedThumbnail>): Promise<{ success: boolean; thumbnail: SavedThumbnail; savedThumbnails: SavedThumbnail[]; activePreviewThumbIds: string[] }> {
    const res = await fetch('/api/workspace/thumbnail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, thumbnail })
    });
    return await res.json();
  },

  async deleteThumbnail(workspaceId: string, thumbnailId: string): Promise<{ success: boolean; savedThumbnails: SavedThumbnail[]; activePreviewThumbIds: string[] }> {
    const res = await fetch(`/api/workspace/thumbnail/${thumbnailId}?workspaceId=${encodeURIComponent(workspaceId)}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  async setPreviewSlots(workspaceId: string, activeIds: string[]): Promise<{ success: boolean; activePreviewThumbIds: string[] }> {
    const res = await fetch('/api/workspace/thumbnail/preview-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, activeIds })
    });
    return await res.json();
  },

  async importThumbnail(payload: any): Promise<{ success: boolean; message: string; thumbnail: SavedThumbnail; activePreviewThumbIds: string[]; totalSaved: number }> {
    const res = await fetch('/api/thumbs/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }
};
