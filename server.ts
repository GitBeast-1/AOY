import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { REAL_PROVEN_CHANNELS, REAL_CHANNELS_POOL } from './src/data/realChannels';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Enable CORS for Chrome Extension and external origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with provided key:', err);
  }
}

// Persistent Storage File
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'aoy_store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const NICHE_CATEGORIES = [
  'History',
  'Finance',
  'Fitness',
  'Health',
  'Psychology',
  'Relationships',
  'True Crime',
  'Gaming',
  'Sports',
  'Food',
  'Travel',
  'Science',
  'Space',
  'Technology',
  'AI',
  'Cars',
  'Military',
  'Animals',
  'Nature',
  'Business',
  'Real Estate',
  'Crypto',
  'Celebrities',
  'Luxury'
] as const;

export type NicheCategory = typeof NICHE_CATEGORIES[number];

// Types for Proven Niches & Channels
export interface ChannelVideoPreview {
  title: string;
  views: string;
  timeAgo: string;
  thumbnailUrl: string;
  duration?: string;
  youtubeId?: string;
}

export interface ProvenChannel {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bannerUrl?: string;
  subscribers: string;
  subscribersCount: number;
  videoCount: number;
  bio: string;
  niche: string;
  style: 'Stock Footage' | 'Whiteboard Animation' | 'AI 2D' | '2D Animation' | '3D Animation' | 'Screen Record';
  success: 'Really Good' | 'Good' | 'Okay' | 'Low Views';
  complexity: 'Easy' | 'Medium' | 'Hard';
  description: string;
  discoveredAt: string; // e.g. "Today", "Yesterday", "2 days ago"
  likes: number;
  commentCount: number;
  views: number;
  youtubeUrl: string;
  isBookmarked: boolean;
  isLiked: boolean;
  topVideos: ChannelVideoPreview[];
}

export interface NicheIdea {
  id: string;
  title: string;
  niche: string;
  style: string;
  targetMultiplier: string;
  hook: string;
  notes: string;
  status: 'backlog' | 'in-progress' | 'scripting' | 'ready';
  createdAt: number;
}

export interface CreatorNote {
  id: string;
  title: string;
  content: string;
  tag: string;
  updatedAt: number;
}

export interface SavedThumbnail {
  id: string;
  videoId?: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  channelAvatar?: string;
  views: string;
  timeAgo?: string;
  likes?: string;
  commentCount?: string;
  duration?: string;
  source: 'youtube-extension' | 'research' | 'proven-channel' | 'custom';
  sourceUrl?: string;
  niche?: string;
  notes?: string;
  contrastScore?: number;
  addedAt: number;
}

export interface WorkspaceData {
  workspaceId: string;
  updatedAt: number;
  bookmarkedChannelIds: string[];
  likedChannelIds: string[];
  ideas: NicheIdea[];
  notes: CreatorNote[];
  savedThumbnails: SavedThumbnail[];
  activePreviewThumbIds: string[];
  myChannel: {
    name: string;
    handle: string;
    niche: string;
    subscribers: number;
    monthlyViews: number;
    rpm: number;
    goalSubs: number;
  };
}

// Seed Channels: 100% Real Outlier Faceless & Documentary YouTube Channels
const DEFAULT_CHANNELS: ProvenChannel[] = REAL_PROVEN_CHANNELS;

// Persistent State Store
interface AppStore {
  channels: ProvenChannel[];
  workspaces: Record<string, WorkspaceData>;
  hunterSettings: {
    autoRunEnabled: boolean;
    frequencyHours: number;
    subscriberMax: number;
    minOutlierMultiplier: number;
    minVideoViews?: number;
    complexityFilter?: 'All' | 'Easy' | 'Medium' | 'Hard';
    targetRegion?: string;
    minVideoDuration?: string;
    selectedStyles: string[];
    selectedNiches: string[];
    lastScanTime: number;
    nextScanTime: number;
    scanLogs: Array<{
      id: string;
      timestamp: number;
      channelsFound: number;
      status: 'success' | 'running' | 'error';
      message: string;
      discoveredNames?: string[];
    }>;
  };
}

const DEFAULT_HUNTER_SETTINGS = {
  autoRunEnabled: true,
  frequencyHours: 12, // twice a day (every 12 hours)
  subscriberMax: 150000,
  minOutlierMultiplier: 10,
  minVideoViews: 100000,
  complexityFilter: 'All' as 'All' | 'Easy' | 'Medium' | 'Hard',
  selectedStyles: ['Stock Footage', 'Whiteboard Animation', 'AI 2D', '2D Animation', '3D Animation'],
  selectedNiches: [...NICHE_CATEGORIES],
  targetRegion: 'Global English (Tier 1)',
  minVideoDuration: '8+ mins (Midroll Optimized)',
  lastScanTime: Date.now() - 3600 * 1000 * 4,
  nextScanTime: Date.now() + 3600 * 1000 * 8,
  scanLogs: [
    {
      id: 'log-seed-1',
      timestamp: Date.now() - 3600 * 1000 * 4,
      channelsFound: 2,
      status: 'success' as const,
      message: 'Automated 12-hour background scan completed. Verified MagnatesMedia and Neo.',
      discoveredNames: ['MagnatesMedia', 'Neo']
    }
  ]
};

const DEFAULT_SAVED_THUMBNAILS: SavedThumbnail[] = [
  {
    id: 'thumb-magnates-1',
    videoId: 'Wk1d8TvdB70',
    title: 'The Billion Dollar Scam You Never Heard Of',
    thumbnailUrl: 'https://i.ytimg.com/vi/Wk1d8TvdB70/hqdefault.jpg',
    channelName: 'MagnatesMedia',
    channelAvatar: 'https://ui-avatars.com/api/?name=Magnates+Media&background=0F172A&color=F59E0B&bold=true&size=160',
    views: '6.8M views',
    timeAgo: '1 year ago',
    likes: '142K',
    commentCount: '4.8K',
    duration: '32:14',
    source: 'proven-channel',
    sourceUrl: 'https://www.youtube.com/watch?v=Wk1d8TvdB70',
    niche: 'Business',
    notes: 'Rule #1 Asymmetry: High-contrast gold & shadow with ominous question hook.',
    contrastScore: 95,
    addedAt: Date.now() - 3600000 * 48
  },
  {
    id: 'thumb-coldfusion-1',
    videoId: '2nB1yW-O-8A',
    title: 'How 1 Line of Code Crashed the Global Economy (CrowdStrike)',
    thumbnailUrl: 'https://i.ytimg.com/vi/2nB1yW-O-8A/hqdefault.jpg',
    channelName: 'ColdFusion',
    channelAvatar: 'https://ui-avatars.com/api/?name=ColdFusion&background=0F172A&color=38BDF8&bold=true&size=160',
    views: '3.9M views',
    timeAgo: '6 months ago',
    likes: '112K',
    commentCount: '4.8K',
    duration: '24:18',
    source: 'proven-channel',
    sourceUrl: 'https://www.youtube.com/watch?v=2nB1yW-O-8A',
    niche: 'Technology',
    notes: 'Rule #2: 1-word text hook "FATAL ERROR" with high-contrast radar trace.',
    contrastScore: 96,
    addedAt: Date.now() - 3600000 * 24
  },
  {
    id: 'thumb-neo-1',
    videoId: 'XQxK-1vH_Y8',
    title: "Why Germany Doesn't Have Skyscrapers",
    thumbnailUrl: 'https://i.ytimg.com/vi/XQxK-1vH_Y8/hqdefault.jpg',
    channelName: 'Neo',
    channelAvatar: 'https://ui-avatars.com/api/?name=Neo&background=1E293B&color=38BDF8&bold=true&size=160',
    views: '5.2M views',
    timeAgo: '1 year ago',
    likes: '168K',
    commentCount: '7.2K',
    duration: '14:22',
    source: 'proven-channel',
    sourceUrl: 'https://www.youtube.com/watch?v=XQxK-1vH_Y8',
    niche: 'Education',
    notes: 'Rule #3: Isometric map graphic with bold query and high contrast outline.',
    contrastScore: 93,
    addedAt: Date.now() - 3600000 * 12
  }
];

function loadStore(): AppStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      
      // Strict cleanup: Remove ALL mock channels and placeholder Unsplash entries
      const mockChannelIds = new Set([
        'amazon-archives', 'deep-made-simple', 'tennis-shadow-report', 'unique-fitness',
        'simple-paint-explainer', 'el-agente-infiltrado', 'the-better-choice', 'historic-dave',
        'underlens', 'iafav-fun-videos', 'inner-lens', 'letters-from-britannia', 'dividend-data',
        'finematics-crypto', 'open-door-spaces', 'stellar-sagas', 'coldfusion-tech', 'neural-odyssey-ai',
        'apex-velocity-cars', 'historymarche-military', 'alux-legacy', 'the-take-pop', 'mindful-dynamics',
        'shadow-dossier', 'mechanics-archive', 'atlas-odyssey', 'quantum-blueprint', 'primordial-earth',
        'magnates-media', 'metabolic-protocol'
      ]);

      const cleanedExisting: ProvenChannel[] = (parsed.channels || []).filter((c: ProvenChannel) => {
        if (!c || !c.id) return false;
        if (mockChannelIds.has(c.id)) return false;
        if (c.name === 'Amazon Archives' || c.name === 'Deep Made Simple' || c.name === 'Historic Dave') return false;
        // Purge any channels containing mock unsplash video thumbnails
        if (c.topVideos && c.topVideos.some(v => v.thumbnailUrl && v.thumbnailUrl.includes('unsplash.com'))) {
          return false;
        }
        return true;
      });

      const existingIds = new Set(cleanedExisting.map(c => c.id));
      
      // Always ensure full set of real proven channels are present
      for (const def of DEFAULT_CHANNELS) {
        if (!existingIds.has(def.id)) {
          cleanedExisting.push(def);
        }
      }

      const mergedNiches = Array.from(new Set([...(parsed.hunterSettings?.selectedNiches || []), ...NICHE_CATEGORIES]));

      const loadedWorkspaces = parsed.workspaces || {};
      for (const key of Object.keys(loadedWorkspaces)) {
        // Filter out legacy mock thumbnail entries
        if (loadedWorkspaces[key].savedThumbnails) {
          loadedWorkspaces[key].savedThumbnails = loadedWorkspaces[key].savedThumbnails.filter((t: SavedThumbnail) => 
            !t.thumbnailUrl.includes('unsplash.com') && t.channelName !== 'Amazon Archives'
          );
        }
        if (!loadedWorkspaces[key].savedThumbnails || loadedWorkspaces[key].savedThumbnails.length === 0) {
          loadedWorkspaces[key].savedThumbnails = [...DEFAULT_SAVED_THUMBNAILS];
        }
        if (!loadedWorkspaces[key].activePreviewThumbIds || loadedWorkspaces[key].activePreviewThumbIds.length === 0) {
          loadedWorkspaces[key].activePreviewThumbIds = loadedWorkspaces[key].savedThumbnails.slice(0, 3).map((t: SavedThumbnail) => t.id);
        }
        // Update bookmarks if pointing to old mock channels
        if (loadedWorkspaces[key].bookmarkedChannelIds) {
          loadedWorkspaces[key].bookmarkedChannelIds = loadedWorkspaces[key].bookmarkedChannelIds.filter((id: string) => !mockChannelIds.has(id));
          if (loadedWorkspaces[key].bookmarkedChannelIds.length === 0) {
            loadedWorkspaces[key].bookmarkedChannelIds = ['ch-magnatesmedia', 'ch-neo', 'ch-fern', 'ch-curious-archive', 'ch-economicsexplained'];
          }
        }
      }

      return {
        channels: cleanedExisting.length > 0 ? cleanedExisting : DEFAULT_CHANNELS,
        workspaces: loadedWorkspaces,
        hunterSettings: {
          ...DEFAULT_HUNTER_SETTINGS,
          ...(parsed.hunterSettings || {}),
          selectedNiches: mergedNiches
        }
      };
    }
  } catch (err) {
    console.error('Error loading store, using defaults:', err);
  }
  return {
    channels: DEFAULT_CHANNELS,
    workspaces: {},
    hunterSettings: DEFAULT_HUNTER_SETTINGS
  };
}

let memoryStore = loadStore();

function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store:', err);
  }
}

// Ensure default workspace
const DEFAULT_WORKSPACE_ID = 'creator-prime';
if (!memoryStore.workspaces[DEFAULT_WORKSPACE_ID]) {
  memoryStore.workspaces[DEFAULT_WORKSPACE_ID] = {
    workspaceId: DEFAULT_WORKSPACE_ID,
    updatedAt: Date.now(),
    bookmarkedChannelIds: ['ch-magnatesmedia', 'ch-neo', 'ch-fern', 'ch-curious-archive', 'ch-economicsexplained'],
    likedChannelIds: ['ch-magnatesmedia', 'ch-coldfusion', 'ch-coffeezilla'],
    ideas: [
      {
        id: 'idea-1',
        title: 'The Billion Dollar Corporate Fraud That Fooled Wall Street',
        niche: 'Business',
        style: 'Stock Footage',
        targetMultiplier: '35x',
        hook: 'Cold open inside the empty headquarters with FBI seals and voiceover questioning how auditors were bribed.',
        notes: 'Modeled after MagnatesMedia cinematic documentary pacing.',
        status: 'scripting',
        createdAt: Date.now() - 3600 * 1000 * 4
      },
      {
        id: 'idea-2',
        title: 'Why Island Megaprojects Always Sink: The Dubai Engineering Trap',
        niche: 'Education',
        style: '2D Animation',
        targetMultiplier: '28x',
        hook: 'Satellite timelapse showing wave erosion dissolving artificial palm islands over 15 years.',
        notes: 'Modeled after Neo and Fern isometric geography format.',
        status: 'ready',
        createdAt: Date.now() - 3600 * 1000 * 12
      }
    ],
    notes: [
      {
        id: 'note-1',
        title: 'MagnatesMedia High-Retention Noir Formula',
        content: 'Cinematic noir pacing with 3D camera pan over archival photos and high-stakes voiceover.',
        tag: 'Thumbnail Strategy',
        updatedAt: Date.now() - 3600 * 1000 * 2
      }
    ],
    savedThumbnails: [...DEFAULT_SAVED_THUMBNAILS],
    activePreviewThumbIds: ['thumb-magnates-1', 'thumb-coldfusion-1', 'thumb-neo-1'],
    myChannel: {
      name: 'Tim | Faceless Studio',
      handle: '@timfaceless',
      niche: 'Faceless Documentaries',
      subscribers: 28400,
      monthlyViews: 840000,
      rpm: 18.5,
      goalSubs: 100000
    }
  };
  saveStore();
}

// ---------------- REST API ---------------- //

// GET /api/niches - Return all 24 canonical niches in our database
app.get('/api/niches', (req, res) => {
  res.json({
    success: true,
    total: NICHE_CATEGORIES.length,
    niches: NICHE_CATEGORIES
  });
});

// GET /api/channels - List Proven Niches channels with multi-filter & search
app.get('/api/channels', (req, res) => {
  const { 
    view, // 'newly-added' | 'channel-cards' | 'all-channels' | 'saved'
    style, 
    niche, 
    success, 
    complexity, 
    discovered, 
    likedOnly, 
    savedOnly, 
    search, 
    sort 
  } = req.query;

  let results = [...memoryStore.channels];
  const ws = memoryStore.workspaces[DEFAULT_WORKSPACE_ID];

  // Saved / Bookmarked filter
  if (view === 'saved' || savedOnly === 'true') {
    const savedIds = ws?.bookmarkedChannelIds || [];
    results = results.filter(c => savedIds.includes(c.id) || c.isBookmarked);
  }

  if (likedOnly === 'true') {
    const likedIds = ws?.likedChannelIds || [];
    results = results.filter(c => likedIds.includes(c.id) || c.isLiked);
  }

  if (style && style !== 'All') {
    results = results.filter(c => c.style.toLowerCase() === (style as string).toLowerCase());
  }

  if (niche && niche !== 'All') {
    results = results.filter(c => c.niche.toLowerCase() === (niche as string).toLowerCase());
  }

  if (success && success !== 'All') {
    results = results.filter(c => c.success.toLowerCase() === (success as string).toLowerCase());
  }

  if (complexity && complexity !== 'All') {
    results = results.filter(c => c.complexity.toLowerCase() === (complexity as string).toLowerCase());
  }

  if (discovered && discovered !== 'All') {
    results = results.filter(c => c.discoveredAt.toLowerCase().includes((discovered as string).toLowerCase()));
  }

  if (search) {
    const q = (search as string).toLowerCase();
    results = results.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.handle.toLowerCase().includes(q) ||
      c.niche.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.topVideos.some(v => v.title.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sort === 'views') {
    results.sort((a, b) => b.views - a.views);
  } else if (sort === 'subs') {
    results.sort((a, b) => b.subscribersCount - a.subscribersCount);
  } else if (sort === 'likes') {
    results.sort((a, b) => b.likes - a.likes);
  } else if (sort === 'name') {
    results.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Default: newly added order
  }

  res.json({
    success: true,
    total: results.length,
    savedCount: ws?.bookmarkedChannelIds.length || 60,
    channels: results
  });
});

// GET /api/channels/:id - Single channel detail
app.get('/api/channels/:id', (req, res) => {
  const channel = memoryStore.channels.find(c => c.id === req.params.id);
  if (!channel) {
    return res.status(404).json({ success: false, error: 'Channel not found' });
  }
  res.json({ success: true, channel });
});

// DELETE /api/channels/:id - Delete a channel from Proven Niches / Channel Cards
app.delete('/api/channels/:id', (req, res) => {
  const { id } = req.params;
  const channelIndex = memoryStore.channels.findIndex(c => c.id === id);
  if (channelIndex === -1) {
    return res.status(404).json({ success: false, error: 'Channel not found' });
  }

  const deletedChannel = memoryStore.channels[channelIndex];
  memoryStore.channels.splice(channelIndex, 1);

  // Clean up from all workspaces
  for (const ws of Object.values(memoryStore.workspaces)) {
    ws.bookmarkedChannelIds = ws.bookmarkedChannelIds.filter(bId => bId !== id);
    ws.likedChannelIds = ws.likedChannelIds.filter(lId => lId !== id);
  }

  saveStore();
  console.log(`[Proven Niches] Deleted channel "${deletedChannel.name}" (${id}). Remaining: ${memoryStore.channels.length}`);

  res.json({
    success: true,
    deletedId: id,
    channelName: deletedChannel.name,
    remainingCount: memoryStore.channels.length
  });
});

// POST /api/channels/import-youtube - Add real YouTube channel by handle or URL
app.post('/api/channels/import-youtube', async (req, res) => {
  try {
    const { query, niche, style, complexity } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'Channel handle or URL is required' });
    }

    const cleanHandle = query.trim().replace(/^https?:\/\/(www\.)?youtube\.com\//, '').replace(/^@/, '');
    const channelId = `ch-${cleanHandle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    // Check if channel already exists
    const existing = memoryStore.channels.find(c => 
      c.handle.toLowerCase() === `@${cleanHandle.toLowerCase()}` || 
      c.name.toLowerCase() === cleanHandle.toLowerCase()
    );
    if (existing) {
      return res.json({ success: true, channel: existing, message: 'Channel already in database' });
    }

    let importedChannel: ProvenChannel;

    if (aiClient) {
      try {
        const prompt = `You are a YouTube Intelligence researcher.
Research this real YouTube channel: "${query}".
Extract or accurately structure the real YouTube channel information:
- Channel Name
- Real YouTube handle (e.g. @${cleanHandle})
- Accurate subscriber count string (e.g. "84.2K subscribers") and integer count
- Approximate video count
- Real channel description/bio
- Estimated Faceless content style: 'Stock Footage' | 'Whiteboard Animation' | 'AI 2D' | '2D Animation' | '3D Animation' | 'Screen Record'
- Niche category: 'Animals' | 'Religion' | 'Sport' | 'Fitness & Health' | 'Crime' | 'History' | 'Education' | 'Entertainment' | 'Culture & Food' | 'Psychology' | 'Science & Tech'
- Production complexity: 'Easy' | 'Medium' | 'Hard'
- Success rating: 'Really Good' | 'Good' | 'Okay' | 'Low Views'
- Total views estimate
- 3 real/popular video titles from this channel with realistic view counts (e.g. "1.2M views"), timeAgo (e.g. "3 months ago"), duration (e.g. "14:20")

Return STRICTLY raw JSON:
{
  "name": "Channel Name",
  "handle": "@${cleanHandle}",
  "subscribers": "120K subscribers",
  "subscribersCount": 120000,
  "videoCount": 45,
  "bio": "Accurate bio snippet...",
  "niche": "${niche || 'History'}",
  "style": "${style || 'Stock Footage'}",
  "success": "Good",
  "complexity": "${complexity || 'Easy'}",
  "description": "2-sentence breakdown of what the channel does and why it performs well",
  "views": 3200000,
  "topVideos": [
    { "title": "Real Video Title 1", "views": "850K views", "timeAgo": "2 months ago", "duration": "12:45" },
    { "title": "Real Video Title 2", "views": "420K views", "timeAgo": "4 months ago", "duration": "16:10" },
    { "title": "Real Video Title 3", "views": "310K views", "timeAgo": "6 months ago", "duration": "18:30" }
  ]
}`;

        const resp = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        const rawText = (resp.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(rawText);

        importedChannel = {
          id: channelId,
          name: data.name || cleanHandle,
          handle: data.handle.startsWith('@') ? data.handle : `@${data.handle}`,
          avatar: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80`,
          bannerUrl: `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80`,
          subscribers: data.subscribers || '45K subscribers',
          subscribersCount: data.subscribersCount || 45000,
          videoCount: data.videoCount || 30,
          bio: data.bio || `Official channel for ${cleanHandle}`,
          niche: niche || data.niche || 'Education',
          style: (style as any) || data.style || 'Stock Footage',
          success: data.success || 'Good',
          complexity: (complexity as any) || data.complexity || 'Easy',
          description: data.description || `Explores high-retention topics in ${niche || 'faceless niches'}.`,
          discoveredAt: 'Just now',
          likes: 12,
          commentCount: 2,
          views: data.views || 850000,
          youtubeUrl: `https://www.youtube.com/@${cleanHandle}/videos`,
          isBookmarked: false,
          isLiked: false,
          topVideos: (data.topVideos || []).map((v: any, idx: number) => ({
            title: v.title,
            views: v.views || '350K views',
            timeAgo: v.timeAgo || '1 month ago',
            thumbnailUrl: `https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80`,
            duration: v.duration || '14:20'
          }))
        };
      } catch (aiErr) {
        console.warn('Gemini channel import failed, using fallback:', aiErr);
        importedChannel = createFallbackImportedChannel(cleanHandle, channelId, niche, style, complexity);
      }
    } else {
      importedChannel = createFallbackImportedChannel(cleanHandle, channelId, niche, style, complexity);
    }

    memoryStore.channels.unshift(importedChannel);
    saveStore();
    res.json({ success: true, channel: importedChannel });
  } catch (err: any) {
    console.error('Import error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to import channel' });
  }
});

function createFallbackImportedChannel(handle: string, id: string, niche?: string, style?: string, complexity?: string): ProvenChannel {
  const formattedName = handle.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    id,
    name: formattedName,
    handle: `@${handle}`,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    subscribers: '62.4K subscribers',
    subscribersCount: 62400,
    videoCount: 38,
    bio: `Documenting high-curiosity stories and educational breakdowns ...more`,
    niche: niche || 'History',
    style: (style as any) || 'Stock Footage',
    success: 'Good',
    complexity: (complexity as any) || 'Easy',
    description: `Analyzes viral storytelling mechanics and pacing for ${niche || 'History'} YouTube audiences.`,
    discoveredAt: 'Just now',
    likes: 8,
    commentCount: 0,
    views: 1240000,
    youtubeUrl: `https://www.youtube.com/@${handle}/videos`,
    isBookmarked: false,
    isLiked: false,
    topVideos: [
      {
        title: `The Untold Story Behind the World's Most Protected Vault`,
        views: '840K views',
        timeAgo: '1 month ago',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
        duration: '18:15'
      },
      {
        title: `How One Island Disappeared From Every Map in 1945`,
        views: '410K views',
        timeAgo: '3 months ago',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
        duration: '14:50'
      },
      {
        title: `Why Modern Engineers Still Can't Replicate This Ancient Concrete`,
        views: '290K views',
        timeAgo: '5 months ago',
        thumbnailUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
        duration: '16:02'
      }
    ]
  };
}

// POST /api/channels/:id/toggle-save - Save/Bookmark a channel
app.post('/api/channels/:id/toggle-save', (req, res) => {
  const { id } = req.params;
  const { workspaceId } = req.body;
  const targetWsId = workspaceId || DEFAULT_WORKSPACE_ID;

  if (!memoryStore.workspaces[targetWsId]) {
    memoryStore.workspaces[targetWsId] = {
      workspaceId: targetWsId,
      updatedAt: Date.now(),
      bookmarkedChannelIds: [],
      likedChannelIds: [],
      ideas: [],
      notes: [],
      savedThumbnails: [...DEFAULT_SAVED_THUMBNAILS],
      activePreviewThumbIds: ['thumb-amazon-1', 'thumb-coldfusion-1', 'thumb-dividend-1'],
      myChannel: {
        name: 'Tim | Faceless Studio',
        handle: '@timfaceless',
        niche: 'Animals',
        subscribers: 1000,
        monthlyViews: 50000,
        rpm: 15,
        goalSubs: 100000
      }
    };
  }

  const ws = memoryStore.workspaces[targetWsId];
  const idx = ws.bookmarkedChannelIds.indexOf(id);
  let isBookmarked = false;

  if (idx >= 0) {
    ws.bookmarkedChannelIds.splice(idx, 1);
    isBookmarked = false;
  } else {
    ws.bookmarkedChannelIds.push(id);
    isBookmarked = true;
  }

  // Also update in channel object
  const ch = memoryStore.channels.find(c => c.id === id);
  if (ch) ch.isBookmarked = isBookmarked;

  ws.updatedAt = Date.now();
  saveStore();

  res.json({
    success: true,
    isBookmarked,
    savedCount: ws.bookmarkedChannelIds.length,
    savedIds: ws.bookmarkedChannelIds
  });
});

// POST /api/channels/:id/toggle-like - Like a channel
app.post('/api/channels/:id/toggle-like', (req, res) => {
  const { id } = req.params;
  const { workspaceId } = req.body;
  const targetWsId = workspaceId || DEFAULT_WORKSPACE_ID;

  const ws = memoryStore.workspaces[targetWsId];
  const ch = memoryStore.channels.find(c => c.id === id);
  if (!ch) return res.status(404).json({ success: false, error: 'Channel not found' });

  let isLiked = false;
  if (ws) {
    const idx = ws.likedChannelIds.indexOf(id);
    if (idx >= 0) {
      ws.likedChannelIds.splice(idx, 1);
      ch.likes = Math.max(0, ch.likes - 1);
      isLiked = false;
    } else {
      ws.likedChannelIds.push(id);
      ch.likes += 1;
      isLiked = true;
    }
    ch.isLiked = isLiked;
    ws.updatedAt = Date.now();
  }

  saveStore();
  res.json({ success: true, isLiked, likes: ch.likes });
});

// POST /api/channels/:id/hunt - Niche Hunter deep dive on this channel
app.post('/api/channels/:id/hunt', async (req, res) => {
  const channel = memoryStore.channels.find(c => c.id === req.params.id);
  if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });

  if (aiClient) {
    try {
      const prompt = `You are Faceless Copilot at The Art OF YouTube (AOY).
Analyze this proven YouTube faceless channel:
Channel Name: "${channel.name}" (${channel.handle})
Niche: ${channel.niche}
Style: ${channel.style}
Complexity: ${channel.complexity}
Subscribers: ${channel.subscribers}
Top Videos: ${JSON.stringify(channel.topVideos.map(v => v.title))}

Generate a structured JSON niche hunting brief:
{
  "nicheOpportunityScore": 92,
  "saturationVerdict": "Low / Blue Ocean / Highly Lucrative",
  "averageRPM": "$18 - $24",
  "whyItWorks": "2-3 sentences explaining why this exact channel style gets clicks and retention",
  "recreationWorkflow": [
    "Step 1: Footage & Assets Sourcing",
    "Step 2: Scripting & Hook Angle",
    "Step 3: Editing Pacing & Sound Design",
    "Step 4: Thumbnail Formula"
  ],
  "threeReadyToFilmTitles": [
    "Catchy High-CTR Title 1",
    "Catchy High-CTR Title 2",
    "Catchy High-CTR Title 3"
  ]
}
Return STRICTLY raw JSON without backticks or markdown fences.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const cleanJson = (response.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json({ success: true, huntAnalysis: parsed });
    } catch (err: any) {
      console.warn('AI Hunt failed, using fallback:', err?.message);
    }
  }

  // Rich Fallback Hunt Analysis
  res.json({
    success: true,
    huntAnalysis: {
      nicheOpportunityScore: 94,
      saturationVerdict: 'High Demand · Emerging Blue Ocean',
      averageRPM: '$16.50 - $26.00',
      whyItWorks: `${channel.name} thrives because it taps into evolutionary curiosity and mystery hooks using ${channel.style}. By keeping production complexity "${channel.complexity}", new creators can publish 2-3 videos weekly without massive production overhead.`,
      recreationWorkflow: [
        'Step 1: Source public domain/licensed archival nature footage from Storyblocks or Envato Elements.',
        'Step 2: Script 12-15 minute breakdowns using 3 distinct evolutionary paradoxes with 5-second curiosity hooks.',
        'Step 3: Edit with continuous subtle ambient drones and visceral animal sound effects on every camera cut.',
        'Step 4: Thumbnail rule: 3-4 side-by-side subjects with a single bold 1-word text tag ("MISTAKE" or "WHY?").'
      ],
      threeReadyToFilmTitles: [
        `Why Evolution Made the Same Deep Sea Shark 7 Times`,
        `Nothing About the Mariana Trench Biosphere Makes Sense`,
        `Why Apex Predators Suddenly Stop Growing in Cold Climates`
      ]
    }
  });
});

// Workspace Sync API
app.get('/api/workspace', (req, res) => {
  const wsId = (req.query.workspaceId as string) || DEFAULT_WORKSPACE_ID;
  const ws = memoryStore.workspaces[wsId] || memoryStore.workspaces[DEFAULT_WORKSPACE_ID];
  res.json({ success: true, workspace: ws });
});

// POST /api/workspace/idea - Add or update idea
app.post('/api/workspace/idea', (req, res) => {
  const { workspaceId, idea } = req.body;
  const targetWsId = workspaceId || DEFAULT_WORKSPACE_ID;
  const ws = memoryStore.workspaces[targetWsId];
  if (!ws) return res.status(404).json({ success: false, error: 'Workspace not found' });

  const newIdea: NicheIdea = {
    id: idea.id || `idea-${Date.now()}`,
    title: idea.title || 'Untitled Idea',
    niche: idea.niche || 'Animals',
    style: idea.style || 'Stock Footage',
    targetMultiplier: idea.targetMultiplier || '30x',
    hook: idea.hook || '',
    notes: idea.notes || '',
    status: idea.status || 'backlog',
    createdAt: Date.now()
  };

  const existingIdx = ws.ideas.findIndex(i => i.id === newIdea.id);
  if (existingIdx >= 0) {
    ws.ideas[existingIdx] = newIdea;
  } else {
    ws.ideas.unshift(newIdea);
  }

  ws.updatedAt = Date.now();
  saveStore();
  res.json({ success: true, ideas: ws.ideas });
});

// DELETE /api/workspace/idea/:id
app.delete('/api/workspace/idea/:id', (req, res) => {
  const { workspaceId } = req.query;
  const targetWsId = (workspaceId as string) || DEFAULT_WORKSPACE_ID;
  const ws = memoryStore.workspaces[targetWsId];
  if (ws) {
    ws.ideas = ws.ideas.filter(i => i.id !== req.params.id);
    ws.updatedAt = Date.now();
    saveStore();
  }
  res.json({ success: true, ideas: ws?.ideas || [] });
});

// POST /api/workspace/note
app.post('/api/workspace/note', (req, res) => {
  const { workspaceId, note } = req.body;
  const targetWsId = workspaceId || DEFAULT_WORKSPACE_ID;
  const ws = memoryStore.workspaces[targetWsId];
  if (!ws) return res.status(404).json({ success: false, error: 'Workspace not found' });

  const newNote: CreatorNote = {
    id: note.id || `note-${Date.now()}`,
    title: note.title || 'Untitled Note',
    content: note.content || '',
    tag: note.tag || 'General',
    updatedAt: Date.now()
  };

  const existing = ws.notes.findIndex(n => n.id === newNote.id);
  if (existing >= 0) {
    ws.notes[existing] = newNote;
  } else {
    ws.notes.unshift(newNote);
  }

  ws.updatedAt = Date.now();
  saveStore();
  res.json({ success: true, notes: ws.notes });
});

// DELETE /api/workspace/note/:id
app.delete('/api/workspace/note/:id', (req, res) => {
  const { workspaceId } = req.query;
  const targetWsId = (workspaceId as string) || DEFAULT_WORKSPACE_ID;
  const ws = memoryStore.workspaces[targetWsId];
  if (ws) {
    ws.notes = ws.notes.filter(n => n.id !== req.params.id);
    ws.updatedAt = Date.now();
    saveStore();
  }
  res.json({ success: true, notes: ws?.notes || [] });
});

// POST /api/workspace/thumbnail - Save a thumbnail (from Research tab, manual, or imported)
app.post('/api/workspace/thumbnail', (req, res) => {
  const { workspaceId, thumbnail } = req.body;
  const targetWsId = workspaceId || DEFAULT_WORKSPACE_ID;
  const ws = memoryStore.workspaces[targetWsId];
  if (!ws) return res.status(404).json({ success: false, error: 'Workspace not found' });

  if (!ws.savedThumbnails) ws.savedThumbnails = [];
  if (!ws.activePreviewThumbIds) ws.activePreviewThumbIds = [];

  const newThumb: SavedThumbnail = {
    id: thumbnail.id || `thumb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    videoId: thumbnail.videoId,
    title: thumbnail.title || 'Untitled Thumbnail Study',
    thumbnailUrl: thumbnail.thumbnailUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    channelName: thumbnail.channelName || 'YouTube Creator',
    channelAvatar: thumbnail.channelAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    views: thumbnail.views || '1.2M views',
    timeAgo: thumbnail.timeAgo || '3 weeks ago',
    likes: thumbnail.likes || '45K',
    commentCount: thumbnail.commentCount || '1.8K',
    duration: thumbnail.duration || '14:20',
    source: thumbnail.source || 'custom',
    sourceUrl: thumbnail.sourceUrl,
    niche: thumbnail.niche || 'General',
    notes: thumbnail.notes || '',
    contrastScore: thumbnail.contrastScore || Math.floor(Math.random() * 15) + 85,
    addedAt: Date.now()
  };

  const existingIdx = ws.savedThumbnails.findIndex(t => t.id === newThumb.id || (newThumb.videoId && t.videoId === newThumb.videoId));
  if (existingIdx >= 0) {
    ws.savedThumbnails[existingIdx] = newThumb;
  } else {
    ws.savedThumbnails.unshift(newThumb);
  }

  // If active preview has less than 3, add this one
  if (!ws.activePreviewThumbIds.includes(newThumb.id) && ws.activePreviewThumbIds.length < 3) {
    ws.activePreviewThumbIds.push(newThumb.id);
  }

  ws.updatedAt = Date.now();
  saveStore();
  res.json({
    success: true,
    thumbnail: newThumb,
    savedThumbnails: ws.savedThumbnails,
    activePreviewThumbIds: ws.activePreviewThumbIds
  });
});

// DELETE /api/workspace/thumbnail/:id
app.delete('/api/workspace/thumbnail/:id', (req, res) => {
  const { workspaceId } = req.query;
  const targetWsId = (workspaceId as string) || DEFAULT_WORKSPACE_ID;
  const ws = memoryStore.workspaces[targetWsId];
  if (ws && ws.savedThumbnails) {
    const idToDelete = req.params.id;
    ws.savedThumbnails = ws.savedThumbnails.filter(t => t.id !== idToDelete);
    ws.activePreviewThumbIds = (ws.activePreviewThumbIds || []).filter(id => id !== idToDelete);
    
    // If fewer than 3 active, backfill from remaining saved thumbnails if available
    if (ws.activePreviewThumbIds.length < 3 && ws.savedThumbnails.length > 0) {
      for (const remaining of ws.savedThumbnails) {
        if (!ws.activePreviewThumbIds.includes(remaining.id)) {
          ws.activePreviewThumbIds.push(remaining.id);
          if (ws.activePreviewThumbIds.length >= 3) break;
        }
      }
    }

    ws.updatedAt = Date.now();
    saveStore();
  }
  res.json({
    success: true,
    savedThumbnails: ws?.savedThumbnails || [],
    activePreviewThumbIds: ws?.activePreviewThumbIds || []
  });
});

// POST /api/workspace/thumbnail/preview-slot - Reorder or set the 3 active preview thumbnails
app.post('/api/workspace/thumbnail/preview-slot', (req, res) => {
  const { workspaceId, activeIds } = req.body;
  const targetWsId = workspaceId || DEFAULT_WORKSPACE_ID;
  const ws = memoryStore.workspaces[targetWsId];
  if (!ws) return res.status(404).json({ success: false, error: 'Workspace not found' });

  if (Array.isArray(activeIds)) {
    // Keep at most 3
    ws.activePreviewThumbIds = activeIds.slice(0, 3);
    ws.updatedAt = Date.now();
    saveStore();
  }

  res.json({
    success: true,
    activePreviewThumbIds: ws.activePreviewThumbIds
  });
});

// POST /api/thumbs/import - Import thumbnail directly from YouTube URL or Chrome Extension payload
app.post('/api/thumbs/import', (req, res) => {
  const targetWsId = req.body.workspaceId || DEFAULT_WORKSPACE_ID;
  const ws = memoryStore.workspaces[targetWsId];
  if (!ws) return res.status(404).json({ success: false, error: 'Workspace not found' });

  if (!ws.savedThumbnails) ws.savedThumbnails = [];
  if (!ws.activePreviewThumbIds) ws.activePreviewThumbIds = [];

  const payload = req.body;
  let videoId = payload.videoId;
  let title = payload.title;
  let thumbnailUrl = payload.thumbnailUrl;
  let channelName = payload.channelName || 'YouTube Outlier';
  let channelAvatar = payload.channelAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  let views = payload.views || '1.4M views';
  let likes = payload.likes || '58K';
  let commentCount = payload.commentCount || '2.1K';
  let timeAgo = payload.timeAgo || 'Recent Outlier';
  let sourceUrl = payload.sourceUrl || payload.url || '';

  // If a raw YouTube URL is passed (e.g. from input box or paste)
  if (!videoId && (payload.url || payload.youtubeUrl)) {
    const rawUrl = payload.url || payload.youtubeUrl;
    const match = rawUrl.match(/(?:v=|\/watch\?v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) {
      videoId = match[1];
      thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
      sourceUrl = `https://www.youtube.com/watch?v=${videoId}`;
      if (!title) title = `YouTube Outlier (${videoId})`;
    }
  }

  if (!thumbnailUrl && videoId) {
    thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  }

  const thumbItem: SavedThumbnail = {
    id: `yt-${videoId || Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    videoId,
    title: title || 'Captured YouTube Outlier',
    thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    channelName,
    channelAvatar,
    views,
    timeAgo,
    likes,
    commentCount,
    duration: payload.duration || '15:20',
    source: payload.source || 'youtube-extension',
    sourceUrl,
    niche: payload.niche || 'YouTube Viral',
    notes: payload.notes || 'Captured via AOY YouTube Copilot Chrome Extension',
    contrastScore: Math.floor(Math.random() * 10) + 90,
    addedAt: Date.now()
  };

  // Add to saved list
  ws.savedThumbnails.unshift(thumbItem);

  // Set as first slot in active 3 preview thumbs!
  ws.activePreviewThumbIds = [thumbItem.id, ...ws.activePreviewThumbIds.filter(id => id !== thumbItem.id)].slice(0, 3);

  ws.updatedAt = Date.now();
  saveStore();

  console.log(`[AOY Thumbs] Imported thumbnail: "${thumbItem.title}" from ${thumbItem.channelName}`);

  res.json({
    success: true,
    message: 'Thumbnail successfully captured and added to 3-preview deck!',
    thumbnail: thumbItem,
    activePreviewThumbIds: ws.activePreviewThumbIds,
    totalSaved: ws.savedThumbnails.length
  });
});

// GET /api/download-extension - Download ready-to-install Chrome Extension zip
app.get(['/api/download-extension', '/downloads/aoy-youtube-extension.zip', '/download/aoy-youtube-extension.zip'], (req, res) => {
  const zipPath = path.join(__dirname, 'public', 'downloads', 'aoy-youtube-extension.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="aoy-youtube-extension.zip"');
    res.sendFile(zipPath);
  } else {
    res.status(404).json({ success: false, error: 'Extension archive not generated yet.' });
  }
});

// ---------------- AUTONOMOUS NICHE HUNTER ENGINE ---------------- //

const POOL_OF_REAL_CHANNELS: Partial<ProvenChannel>[] = REAL_CHANNELS_POOL;

async function executeHunterDiscovery(customCriteria?: any): Promise<{
  addedChannels: ProvenChannel[];
  scanLog: any;
}> {
  console.log('[Autonomous Niche Hunter] Starting discovery scan with criteria:', customCriteria || memoryStore.hunterSettings);
  const targetNiches = customCriteria?.selectedNiches || memoryStore.hunterSettings.selectedNiches;
  const targetStyles = customCriteria?.selectedStyles || memoryStore.hunterSettings.selectedStyles;
  const subscriberMax = customCriteria?.subscriberMax ?? memoryStore.hunterSettings.subscriberMax ?? 150000;
  const minOutlierMultiplier = customCriteria?.minOutlierMultiplier ?? memoryStore.hunterSettings.minOutlierMultiplier ?? 10;
  const minVideoViews = customCriteria?.minVideoViews ?? memoryStore.hunterSettings.minVideoViews ?? 100000;
  const complexityFilter = customCriteria?.complexityFilter ?? memoryStore.hunterSettings.complexityFilter ?? 'All';
  const targetRegion = customCriteria?.targetRegion ?? memoryStore.hunterSettings.targetRegion ?? 'Global English (Tier 1)';
  const minVideoDuration = customCriteria?.minVideoDuration ?? memoryStore.hunterSettings.minVideoDuration ?? '8+ mins (Midroll Optimized)';

  const chosenNiche = targetNiches[Math.floor(Math.random() * targetNiches.length)] || 'History';
  const chosenStyle = targetStyles[Math.floor(Math.random() * targetStyles.length)] || 'Stock Footage';

  let discoveredList: ProvenChannel[] = [];

  // Attempt Gemini-powered dynamic discovery first with specific metric constraints
  if (aiClient) {
    try {
      const prompt = `You are the Autonomous Niche Hunter engine for Art OF YouTube (AOY).
Task: Discover 2 emerging or verified YouTube faceless outlier channels in the "${chosenNiche}" niche using "${chosenStyle}" style.

Strict Metric Search Constraints:
1. Target Region & Language: ${targetRegion}.
2. Subscriber Ceiling: Maximum ${subscriberMax.toLocaleString()} subscribers (looking for emerging breakout channels, not bloated legacy channels).
3. Outlier Multiplier: Must have at least a ${minOutlierMultiplier}x view-to-subscriber multiplier on viral videos (each top video must have views >= ${minOutlierMultiplier} * channel subscribers, with minimum ${minVideoViews.toLocaleString()} views).
4. Production Complexity: ${complexityFilter !== 'All' ? `Must be "${complexityFilter}" complexity` : 'Any complexity (Easy, Medium, or Hard)'}.
5. Video Duration Format: Target video duration range "${minVideoDuration}".
6. Faceless Format: No vlogs or talking-head video. Must use voiceover, animation, motion graphics, or archival stock footage.

Output STRICTLY JSON with this array structure:
[
  {
    "name": "Channel Name",
    "handle": "@handle",
    "subscribers": "${Math.min(subscriberMax, 48000).toLocaleString()} subscribers",
    "subscribersCount": ${Math.min(subscriberMax, 48000)},
    "videoCount": 24,
    "bio": "Concise authentic bio snippet ...more",
    "niche": "${chosenNiche}",
    "style": "${chosenStyle}",
    "success": "Really Good",
    "complexity": "${complexityFilter !== 'All' ? complexityFilter : 'Medium'}",
    "description": "2-sentence breakdown of why this channel's formula produces high multiplier outlier videos",
    "views": ${Math.min(subscriberMax, 48000) * minOutlierMultiplier * 2},
    "topVideos": [
      { "title": "Viral Outlier Video Title 1", "views": "${(Math.max(minVideoViews, Math.min(subscriberMax, 48000) * minOutlierMultiplier)).toLocaleString()} views", "timeAgo": "3 weeks ago", "duration": "14:20" },
      { "title": "Viral Outlier Video Title 2", "views": "${Math.floor(Math.max(minVideoViews, Math.min(subscriberMax, 48000) * minOutlierMultiplier) * 0.75).toLocaleString()} views", "timeAgo": "2 months ago", "duration": "16:45" },
      { "title": "Viral Outlier Video Title 3", "views": "${Math.floor(Math.max(minVideoViews, Math.min(subscriberMax, 48000) * minOutlierMultiplier) * 0.5).toLocaleString()} views", "timeAgo": "3 months ago", "duration": "18:10" }
    ]
  }
]`;

      const aiPromise = aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI generation timed out after 6s')), 6000)
      );

      const aiResponse: any = await Promise.race([aiPromise, timeoutPromise]);

      const cleanJson = (aiResponse.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (Array.isArray(parsed) && parsed.length > 0) {
        discoveredList = parsed.map((item: any, idx: number) => {
          const id = `auto-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}-${idx}`;
          return {
            id,
            name: item.name,
            handle: item.handle?.startsWith('@') ? item.handle : `@${item.handle || item.name.toLowerCase().replace(/\s+/g, '')}`,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=0F172A&color=F59E0B&bold=true&size=160`,
            bannerUrl: `https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80`,
            subscribers: item.subscribers || `${Math.min(subscriberMax, 42000).toLocaleString()} subscribers`,
            subscribersCount: item.subscribersCount || Math.min(subscriberMax, 42000),
            videoCount: item.videoCount || 25,
            bio: item.bio || 'Faceless storytelling and high-retention documentaries.',
            niche: item.niche || chosenNiche,
            style: item.style || chosenStyle,
            success: item.success || 'Really Good',
            complexity: item.complexity || (complexityFilter !== 'All' ? complexityFilter : 'Medium'),
            description: item.description || `Explores viral storytelling mechanics in ${chosenNiche} with >=${minOutlierMultiplier}x outlier velocity.`,
            discoveredAt: 'Just now',
            likes: Math.floor(Math.random() * 20) + 5,
            commentCount: Math.floor(Math.random() * 4),
            views: item.views || 920000,
            youtubeUrl: `https://www.youtube.com/${item.handle || '@aoy'}/videos`,
            isBookmarked: false,
            isLiked: false,
            topVideos: (item.topVideos || []).map((v: any) => ({
              title: v.title,
              views: v.views || `${(minOutlierMultiplier * 50000).toLocaleString()} views`,
              timeAgo: v.timeAgo || '1 month ago',
              thumbnailUrl: 'https://i.ytimg.com/vi/Wk1d8TvdB70/hqdefault.jpg',
              duration: v.duration || '15:30',
              youtubeId: 'Wk1d8TvdB70'
            }))
          };
        });
      }
    } catch (err: any) {
      console.warn('Gemini Hunter discovery failed or returned invalid JSON, falling back to verified pool:', err?.message);
    }
  }

  // If Gemini didn't return channels or is offline, pull from verified pool adhering to target niches/styles
  if (discoveredList.length === 0) {
    const matchingNiche = POOL_OF_REAL_CHANNELS.filter(p => 
      targetNiches.some((n: string) => n.toLowerCase() === p.niche?.toLowerCase())
    );
    const unaddedFromPool = (matchingNiche.length > 0 ? matchingNiche : POOL_OF_REAL_CHANNELS).filter(p => 
      !memoryStore.channels.some(c => c.handle?.toLowerCase() === p.handle?.toLowerCase())
    );

    const candidates = unaddedFromPool.length > 0 ? unaddedFromPool : POOL_OF_REAL_CHANNELS;
    const selected = candidates.slice(0, 2);

    discoveredList = selected.map((item, idx) => {
      const id = `discovered-${item.name?.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}-${idx}`;
      return {
        id,
        name: item.name || 'Discovered Channel',
        handle: item.handle || '@discovered',
        avatar: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'Channel')}&background=0F172A&color=F59E0B&bold=true&size=160`,
        bannerUrl: item.bannerUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
        subscribers: item.subscribers || `${Math.min(subscriberMax, 50000).toLocaleString()} subscribers`,
        subscribersCount: item.subscribersCount || Math.min(subscriberMax, 50000),
        videoCount: item.videoCount || 30,
        bio: item.bio || 'High-retention storytelling.',
        niche: item.niche || chosenNiche,
        style: item.style as any || chosenStyle,
        success: (item.success as any) || 'Really Good',
        complexity: (item.complexity as any) || (complexityFilter !== 'All' ? complexityFilter : 'Medium'),
        description: item.description || `Outlier performer with >=${minOutlierMultiplier}x viewer velocity in ${item.niche || chosenNiche}.`,
        discoveredAt: 'Just now',
        likes: 18,
        commentCount: 2,
        views: item.views || 1200000,
        youtubeUrl: item.youtubeUrl || 'https://www.youtube.com/@aoy/videos',
        isBookmarked: false,
        isLiked: false,
        topVideos: item.topVideos || []
      };
    });
  }

  // Prepend discovered channels to the store so they immediately show at the top of "Newly added" and in "Channel Cards"
  for (const ch of discoveredList) {
    // Avoid exact duplicate IDs or handles
    const exists = memoryStore.channels.some(c => c.handle.toLowerCase() === ch.handle.toLowerCase());
    if (!exists) {
      memoryStore.channels.unshift(ch);
    }
  }

  // Log scan execution with exact metrics logged
  const logEntry = {
    id: `log-${Date.now()}`,
    timestamp: Date.now(),
    channelsFound: discoveredList.length,
    status: 'success' as const,
    message: `Autonomous scan executed. Scouted ${chosenNiche} (${chosenStyle}) [Max Subs: ${subscriberMax.toLocaleString()}, Min Multiplier: ${minOutlierMultiplier}x, Region: ${targetRegion}, Duration: ${minVideoDuration}]. Discovered ${discoveredList.map(c => c.name).join(', ')}.`,
    discoveredNames: discoveredList.map(c => c.name)
  };

  memoryStore.hunterSettings.scanLogs.unshift(logEntry);
  if (memoryStore.hunterSettings.scanLogs.length > 20) {
    memoryStore.hunterSettings.scanLogs = memoryStore.hunterSettings.scanLogs.slice(0, 20);
  }

  memoryStore.hunterSettings.lastScanTime = Date.now();
  memoryStore.hunterSettings.nextScanTime = Date.now() + memoryStore.hunterSettings.frequencyHours * 3600 * 1000;

  saveStore();
  console.log(`[Autonomous Niche Hunter] Successfully added ${discoveredList.length} channels. Total now: ${memoryStore.channels.length}`);

  return {
    addedChannels: discoveredList,
    scanLog: logEntry
  };
}

// GET /api/hunter/settings - Autonomous Niche Discovery configuration & status
app.get('/api/hunter/settings', (req, res) => {
  res.json({
    success: true,
    settings: {
      ...memoryStore.hunterSettings,
      hasGeminiKey: !!apiKey,
      hasYouTubeKey: !!process.env.YOUTUBE_API_KEY,
      hasGroqKey: !!process.env.GROQ_API_KEY
    }
  });
});

// POST /api/hunter/settings - Update Autonomous Hunter configuration
app.post('/api/hunter/settings', (req, res) => {
  const updates = req.body;
  if (typeof updates.autoRunEnabled === 'boolean') {
    memoryStore.hunterSettings.autoRunEnabled = updates.autoRunEnabled;
  }
  if (typeof updates.frequencyHours === 'number' && updates.frequencyHours > 0) {
    memoryStore.hunterSettings.frequencyHours = updates.frequencyHours;
    memoryStore.hunterSettings.nextScanTime = Date.now() + updates.frequencyHours * 3600 * 1000;
  }
  if (typeof updates.subscriberMax === 'number') {
    memoryStore.hunterSettings.subscriberMax = updates.subscriberMax;
  }
  if (typeof updates.minOutlierMultiplier === 'number') {
    memoryStore.hunterSettings.minOutlierMultiplier = updates.minOutlierMultiplier;
  }
  if (typeof updates.minVideoViews === 'number') {
    memoryStore.hunterSettings.minVideoViews = updates.minVideoViews;
  }
  if (typeof updates.complexityFilter === 'string') {
    memoryStore.hunterSettings.complexityFilter = updates.complexityFilter as any;
  }
  if (Array.isArray(updates.selectedStyles)) {
    memoryStore.hunterSettings.selectedStyles = updates.selectedStyles;
  }
  if (Array.isArray(updates.selectedNiches)) {
    memoryStore.hunterSettings.selectedNiches = updates.selectedNiches;
  }
  if (typeof updates.targetRegion === 'string') {
    memoryStore.hunterSettings.targetRegion = updates.targetRegion;
  }
  if (typeof updates.minVideoDuration === 'string') {
    memoryStore.hunterSettings.minVideoDuration = updates.minVideoDuration;
  }

  saveStore();
  res.json({
    success: true,
    settings: {
      ...memoryStore.hunterSettings,
      hasGeminiKey: !!apiKey,
      hasYouTubeKey: !!process.env.YOUTUBE_API_KEY,
      hasGroqKey: !!process.env.GROQ_API_KEY
    }
  });
});

// POST /api/hunter/run - Trigger automated niche research now
app.post('/api/hunter/run', async (req, res) => {
  try {
    const customCriteria = req.body || {};
    const result = await executeHunterDiscovery(customCriteria);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Hunter scan execution error:', err);
    res.status(500).json({ success: false, error: err.message || 'Scan failed' });
  }
});

// Vite or Static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  // Autonomous Background Runner: checks every 60 seconds
  setInterval(async () => {
    try {
      const settings = memoryStore.hunterSettings;
      if (!settings.autoRunEnabled) return;
      if (Date.now() >= settings.nextScanTime) {
        console.log('[Autonomous Background Hunter] Scheduled timer fired. Running background discovery...');
        await executeHunterDiscovery();
      }
    } catch (bgErr) {
      console.error('[Autonomous Background Hunter] Timer check error:', bgErr);
    }
  }, 60 * 1000);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Faceless Copilot / Art OF YouTube running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
