import { UserProfile, Post, Ad, Campaign, Trend, LibraryItem, ScheduleEntry } from '../../types';
import { MOCK_API_DELAY, DEFAULT_BUSINESS_PROFILE } from '../../constants';

// Mock Database Service
// This service simulates a backend database using local memory.

const DB_STORAGE_KEY = 'vitrinex_mock_db';

const defaultMockDb = {
    users: {
        'mock-user-123': {
            id: 'mock-user-123',
            email: 'user@example.com',
            plan: 'premium',
            businessProfile: DEFAULT_BUSINESS_PROFILE,
        } as UserProfile,
    },
    posts: {} as { [id: string]: Post },
    ads: {} as { [id: string]: Ad },
    campaigns: {} as { [id: string]: Campaign },
    trends: {} as { [id: string]: Trend },
    library: {} as { [id: string]: LibraryItem },
    schedule: {} as { [id: string]: ScheduleEntry },
};

// Define the DB structure type
type MockDbType = {
    users: { [id: string]: UserProfile };
    posts: { [id: string]: Post };
    ads: { [id: string]: Ad };
    campaigns: { [id: string]: Campaign };
    trends: { [id: string]: Trend };
    library: { [id: string]: LibraryItem };
    schedule: { [id: string]: ScheduleEntry };
};

function loadDb(): MockDbType {
    try {
        const stored = localStorage.getItem(DB_STORAGE_KEY);
        if (stored) {
            // Need to cast the parsed object to MockDbType as JSON.parse returns any
            return JSON.parse(stored) as MockDbType;
        }
    } catch (e) {
        console.warn('Failed to load mock DB from local storage', e);
    }
    return defaultMockDb;
}

const mockDb = loadDb();

function saveDb() {
    try {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(mockDb));
    } catch (e) {
        console.warn('Failed to save mock DB to local storage', e);
    }
}

// Generic mock function to simulate DB operations
async function mockDbOperation<T>(operation: () => T | Promise<T>): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const result = await operation();
    saveDb();
    return result;
}

// --- User Profile Operations ---
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    return mockDbOperation(() => {
        const user = mockDb.users[userId];
        if (!user) {
            // Create a default profile if not found
            mockDb.users[userId] = {
                id: userId,
                email: 'mock-user@vitrinex.com',
                plan: 'free',
                businessProfile: DEFAULT_BUSINESS_PROFILE,
            };
            return mockDb.users[userId];
        }
        return user;
    });
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<void> => {
    return mockDbOperation(() => {
        if (mockDb.users[userId]) {
            mockDb.users[userId] = { ...mockDb.users[userId], ...profile };
        } else {
            console.warn(`User profile for ${userId} not found (mock).`);
        }
    });
};

// --- Content (Posts, Ads, Campaigns, Trends, Library, Schedule) Operations ---
export const savePost = async (post: Post): Promise<Post> => {
    return mockDbOperation(() => {
        if (!post.id) post.id = `post-${Date.now()}`;
        mockDb.posts[post.id] = post;
        return post;
    });
};

export const getPosts = async (userId: string): Promise<Post[]> => {
    return mockDbOperation(() => Object.values(mockDb.posts).filter(p => p.userId === userId));
};

export const saveAd = async (ad: Ad): Promise<Ad> => {
    return mockDbOperation(() => {
        if (!ad.id) ad.id = `ad-${Date.now()}`;
        mockDb.ads[ad.id] = ad;
        return ad;
    });
};

export const getAds = async (userId: string): Promise<Ad[]> => {
    return mockDbOperation(() => Object.values(mockDb.ads).filter(a => a.userId === userId));
};

export const saveCampaign = async (campaign: Campaign): Promise<Campaign> => {
    return mockDbOperation(() => {
        if (!campaign.id) campaign.id = `campaign-${Date.now()}`;
        mockDb.campaigns[campaign.id] = campaign;
        return campaign;
    });
};

export const getCampaigns = async (userId: string): Promise<Campaign[]> => {
    return mockDbOperation(() => Object.values(mockDb.campaigns).filter(c => c.userId === userId));
};

export const saveTrend = async (trend: Trend): Promise<Trend> => {
    return mockDbOperation(() => {
        if (!trend.id) trend.id = `trend-${Date.now()}`;
        mockDb.trends[trend.id] = trend;
        return trend;
    });
};

export const getTrends = async (userId: string): Promise<Trend[]> => {
    return mockDbOperation(() => Object.values(mockDb.trends).filter(t => t.userId === userId));
};


export const saveLibraryItem = async (item: LibraryItem): Promise<LibraryItem> => {
    return mockDbOperation(() => {
        if (!item.id) item.id = `lib-${Date.now()}`;
        mockDb.library[item.id] = item;
        return item;
    });
};

export const getLibraryItems = async (userId: string, tags?: string[]): Promise<LibraryItem[]> => {
    return mockDbOperation(() => {
        let items = Object.values(mockDb.library).filter(item => item.userId === userId);
        if (tags && tags.length > 0) {
            items = items.filter(item => tags.some(tag => item.tags.includes(tag)));
        }
        return items;
    });
};

export const deleteLibraryItem = async (itemId: string): Promise<void> => {
    return mockDbOperation(() => {
        if (mockDb.library[itemId]) {
            delete mockDb.library[itemId];
        }
    });
};

export const saveScheduleEntry = async (entry: ScheduleEntry): Promise<ScheduleEntry> => {
    return mockDbOperation(() => {
        if (!entry.id) entry.id = `schedule-${Date.now()}`;
        mockDb.schedule[entry.id] = entry;
        return entry;
    });
};

export const getScheduleEntries = async (userId: string): Promise<ScheduleEntry[]> => {
    return mockDbOperation(() => Object.values(mockDb.schedule).filter(s => s.userId === userId));
};

export const deleteScheduleEntry = async (entryId: string): Promise<void> => {
    return mockDbOperation(() => {
        if (mockDb.schedule[entryId]) {
            delete mockDb.schedule[entryId];
        }
    });
};
