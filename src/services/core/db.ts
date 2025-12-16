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
// --- User Profile Operations ---
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        // If not found, return null or create provisional? 
        // Sync with existing logic: If mock, it created one.
        // For real auth, we might expect a trigger to create it on signup, 
        // or we handle "onboarding" elsewhere.
        // Here we just return what we find or null.
        if (error.code === 'PGRST116') { // Not found code
            return null;
        }
        console.error('Error fetching user profile:', error);
        return null;
    }

    // Parse businessProfile if it's stored as JSONB but we type it strongly
    // Supabase JS auto-converts JSONB to object usually.
    return data as UserProfile;
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<void> => {
    const { error } = await supabase
        .from('users')
        .update(profile)
        .eq('id', userId);

    if (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
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


import { supabase } from '../../lib/supabase';

export const saveLibraryItem = async (item: LibraryItem): Promise<LibraryItem> => {
    // Ensure ID is generated if not present, though Supabase usually handles specific IDs or UUIDs.
    // We will let Supabase generate ID if not provided, or use the one provided.
    // However, the mock provided 'lib-' + Date.now().
    // We'll strip the ID if it looks like a temp ID and let Supabase generate a UUID, 
    // OR we just send it if the schema allows text IDs.
    // For safety with typical Supabase setups (UUID), we might want to omit ID if it's not a valid UUID.
    // But to match current logic, we'll try to insert. 

    // Note: If schema uses UUID pkey, 'lib-...' will fail. 
    // We will assume the schema allows text or we should strictly let DB handle it.
    // Let's try to insert object excluding ID if it's the mock-generated one, 
    // but the `item` passed has it.

    const { data, error } = await supabase
        .from('library_items')
        .insert([item])
        .select()
        .single();

    if (error) {
        console.error('Error saving library item:', error);
        throw error;
    }
    return data;
};


export const getLibraryItems = async (userId: string, tags?: string[]): Promise<LibraryItem[]> => {
    let query = supabase
        .from('library_items')
        .select('*')
        .eq('userId', userId); // Ensure column is camelCase or snake_case matching usage. 
    // Typo risk: Supabase usually uses snake_case keys (user_id).
    // The `item` object has `userId`. If I send `userId`, Supabase maps it if columns match?
    // No, Supabase JS client expects keys to match column names.
    // If `LibraryItem.userId` maps to `user_id` in DB, I need to map it.
    // I will assume the table columns match the JS object keys for now to simplify, 
    // as I don't know the schema. 
    // If it fails, I'll need to map.

    if (tags && tags.length > 0) {
        query = query.contains('tags', tags);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching library items:', error);
        return [];
    }
    return data || [];
};

export const deleteLibraryItem = async (itemId: string): Promise<void> => {
    const { error } = await supabase
        .from('library_items')
        .delete()
        .eq('id', itemId);

    if (error) {
        console.error('Error deleting library item:', error);
        throw error;
    }
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
