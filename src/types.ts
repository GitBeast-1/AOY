export interface ChannelVideoPreview {
  title: string;
  views: string;
  timeAgo: string;
  thumbnailUrl: string;
  duration?: string;
  youtubeId?: string;
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
  discoveredAt: string;
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

export interface NicheHuntAnalysis {
  nicheOpportunityScore: number;
  saturationVerdict: string;
  averageRPM: string;
  whyItWorks: string;
  recreationWorkflow: string[];
  threeReadyToFilmTitles: string[];
}

export interface HunterScanLog {
  id: string;
  timestamp: number;
  channelsFound: number;
  status: 'success' | 'running' | 'error';
  message: string;
  discoveredNames?: string[];
}

export interface HunterSettings {
  autoRunEnabled: boolean;
  frequencyHours: number; // e.g. 12 (twice a day)
  subscriberMax: number; // e.g. 50000, 150000, 500000
  minOutlierMultiplier: number; // e.g. 5, 10, 20, 35
  minVideoViews?: number; // e.g. 50000, 250000, 500000
  complexityFilter?: 'All' | 'Easy' | 'Medium' | 'Hard';
  selectedStyles: string[];
  selectedNiches: string[];
  targetRegion?: string;
  minVideoDuration?: string;
  lastScanTime: number;
  nextScanTime: number;
  groqModel?: string;
  hasYouTubeKey: boolean;
  hasGroqKey: boolean;
  hasGeminiKey: boolean;
  scanLogs: HunterScanLog[];
}
