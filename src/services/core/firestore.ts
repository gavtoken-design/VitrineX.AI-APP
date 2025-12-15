import { UserProfile, Post, Ad, Campaign, Trend, LibraryItem, ScheduleEntry } from '../../types';
import { MOCK_API_DELAY, DEFAULT_BUSINESS_PROFILE } from '../../constants';

// In a real application, this would interact with a backend service (e.g., Cloud Functions)
// which then interacts with Google Firestore.
// For this frontend-only app, these are mock functions.

const mockDb = {
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

// Generic mock function to simulate Firestore operations
async function mockFirestoreOperation<T>(operation: () => T | Promise<T>): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return await operation();
}

// --- User Profile Operations ---
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    // console.log(`Simulating fetching user profile for: ${userId}`);
    return mockFirestoreOperation(() => {
        const user = mockDb.users[userId];
        if (!user) {
            // Create a default profile if not found
            mockDb.users[userId] = {
                id: userId,
                email: 'mock-user@vitrinex.com',
                plan: 'free',
                businessProfile: DEFAULT_BUSINESS_PROFILE,
            };
            // console.log('Created default user profile for mock user.');
            return mockDb.users[userId];
        }
        return user;
    });
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<void> => {
    // console.log(`Simulating updating user profile for: ${userId}`, profile);
    return mockFirestoreOperation(() => {
        if (mockDb.users[userId]) {
            mockDb.users[userId] = { ...mockDb.users[userId], ...profile };
            // console.log('User profile updated (mock).');
        } else {
            console.warn(`User profile for ${userId} not found (mock).`);
        }
    });
};

// --- Content (Posts, Ads, Campaigns, Trends, Library, Schedule) Operations ---
export const savePost = async (post: Post): Promise<Post> => {
    return mockFirestoreOperation(() => {
        if (!post.id) post.id = `post-${Date.now()}`;
        mockDb.posts[post.id] = post;
        return post;
    });
};

export const getPosts = async (userId: string): Promise<Post[]> => {
    return mockFirestoreOperation(() => Object.values(mockDb.posts).filter(p => p.userId === userId));
};

export const saveAd = async (ad: Ad): Promise<Ad> => {
    return mockFirestoreOperation(() => {
        if (!ad.id) ad.id = `ad-${Date.now()}`;
        mockDb.ads[ad.id] = ad;
        return ad;
    });
};

export const getAds = async (userId: string): Promise<Ad[]> => {
    return mockFirestoreOperation(() => Object.values(mockDb.ads).filter(a => a.userId === userId));
};

export const saveCampaign = async (campaign: Campaign): Promise<Campaign> => {
    return mockFirestoreOperation(() => {
        if (!campaign.id) campaign.id = `campaign-${Date.now()}`;
        mockDb.campaigns[campaign.id] = campaign;
        return campaign;
    });
};

export const getCampaigns = async (userId: string): Promise<Campaign[]> => {
    return mockFirestoreOperation(() => Object.values(mockDb.campaigns).filter(c => c.userId === userId));
};

export const saveTrend = async (trend: Trend): Promise<Trend> => {
    return mockFirestoreOperation(() => {
        if (!trend.id) trend.id = `trend-${Date.now()}`;
        mockDb.trends[trend.id] = trend;
        return trend;
    });
};

export const getTrends = async (userId: string): Promise<Trend[]> => {
    return mockFirestoreOperation(() => Object.values(mockDb.trends).filter(t => t.userId === userId));
};


export const saveLibraryItem = async (item: LibraryItem): Promise<LibraryItem> => {
    return mockFirestoreOperation(() => {
        if (!item.id) item.id = `lib-${Date.now()}`;
        mockDb.library[item.id] = item;
        return item;
    });
};

export const getLibraryItems = async (userId: string, tags?: string[]): Promise<LibraryItem[]> => {
    return mockFirestoreOperation(() => {
        let items = Object.values(mockDb.library).filter(item => item.userId === userId);
        if (tags && tags.length > 0) {
            items = items.filter(item => tags.some(tag => item.tags.includes(tag)));
        }
        return items;
    });
};

export const deleteLibraryItem = async (itemId: string): Promise<void> => {
    return mockFirestoreOperation(() => {
        if (mockDb.library[itemId]) {
            delete mockDb.library[itemId];
        }
    });
};

export const saveScheduleEntry = async (entry: ScheduleEntry): Promise<ScheduleEntry> => {
    return mockFirestoreOperation(() => {
        if (!entry.id) entry.id = `schedule-${Date.now()}`;
        mockDb.schedule[entry.id] = entry;
        return entry;
    });
};

export const getScheduleEntries = async (userId: string): Promise<ScheduleEntry[]> => {
    return mockFirestoreOperation(() => Object.values(mockDb.schedule).filter(s => s.userId === userId));
};

export const deleteScheduleEntry = async (entryId: string): Promise<void> => {
    return mockFirestoreOperation(() => {
        if (mockDb.schedule[entryId]) {
            delete mockDb.schedule[entryId];
        }
    });
};
