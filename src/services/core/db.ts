import { UserProfile, Post, Ad, Campaign, Trend, LibraryItem, ScheduleEntry } from '../../types';
import { supabase } from '../../lib/supabase';

// Real Supabase Database Service
// Replaces the previous Mock Database Service.

// --- Helper for Errors ---
const handleError = (context: string, error: any) => {
    console.error(`Error in ${context}:`, error);
    // Podemos relançar ou retornar null dependendo da estratégia.
    // Aqui vamos relançar para que a UI possa mostrar o Toast de erro.
    throw new Error(error.message || `Falha em ${context}`);
};

// --- User Profile Operations ---
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    // Nota: O userId mock-user-123 causará erro aqui se não existir no Auth.
    // O app deve garantir que o usuário esteja logado.

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') { // Not found code
            return null;
        }
        console.warn('Profile not found or error:', error);
        return null;
    }
    return data as UserProfile;
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<void> => {
    const { error } = await supabase
        .from('users')
        .update(profile)
        .eq('id', userId);

    if (error) handleError('updateUserProfile', error);
};

// --- Content Operations ---

export const savePost = async (post: Post): Promise<Post> => {
    const { data, error } = await supabase
        .from('posts')
        .upsert(post) // Upsert allows insert or update based on ID
        .select()
        .single();

    if (error) handleError('savePost', error);
    return data as Post;
};

export const getPosts = async (userId: string): Promise<Post[]> => {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

    if (error) handleError('getPosts', error);
    return (data as Post[]) || [];
};

export const saveAd = async (ad: Ad): Promise<Ad> => {
    const { data, error } = await supabase
        .from('ads')
        .upsert(ad)
        .select()
        .single();

    if (error) handleError('saveAd', error);
    return data as Ad;
};

export const getAds = async (userId: string): Promise<Ad[]> => {
    const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

    if (error) handleError('getAds', error);
    return (data as Ad[]) || [];
};

export const saveCampaign = async (campaign: Campaign): Promise<Campaign> => {
    const { data, error } = await supabase
        .from('campaigns')
        .upsert(campaign)
        .select()
        .single();

    if (error) handleError('saveCampaign', error);
    return data as Campaign;
};

export const getCampaigns = async (userId: string): Promise<Campaign[]> => {
    const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

    if (error) handleError('getCampaigns', error);
    return (data as Campaign[]) || [];
};

export const saveTrend = async (trend: Trend): Promise<Trend> => {
    const { data, error } = await supabase
        .from('trends')
        .upsert(trend)
        .select()
        .single();

    if (error) handleError('saveTrend', error);
    return data as Trend;
};

export const getTrends = async (userId: string): Promise<Trend[]> => {
    const { data, error } = await supabase
        .from('trends')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

    if (error) handleError('getTrends', error);
    return (data as Trend[]) || [];
};

// --- Library Operations ---

export const saveLibraryItem = async (item: LibraryItem): Promise<LibraryItem> => {
    const { data, error } = await supabase
        .from('library_items')
        .upsert(item)
        .select()
        .single();

    if (error) handleError('saveLibraryItem', error);
    return data as LibraryItem;
};

export const getLibraryItems = async (userId: string, tags?: string[]): Promise<LibraryItem[]> => {
    let query = supabase
        .from('library_items')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

    if (tags && tags.length > 0) {
        query = query.contains('tags', tags);
    }

    const { data, error } = await query;

    if (error) handleError('getLibraryItems', error);
    return (data as LibraryItem[]) || [];
};

export const deleteLibraryItem = async (itemId: string): Promise<void> => {
    const { error } = await supabase
        .from('library_items')
        .delete()
        .eq('id', itemId);

    if (error) handleError('deleteLibraryItem', error);
};

// --- Schedule Operations ---

export const saveScheduleEntry = async (entry: ScheduleEntry): Promise<ScheduleEntry> => {
    const { data, error } = await supabase
        .from('schedule')
        .upsert(entry)
        .select()
        .single();

    if (error) handleError('saveScheduleEntry', error);
    return data as ScheduleEntry;
};

export const getScheduleEntries = async (userId: string): Promise<ScheduleEntry[]> => {
    const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .eq('userId', userId)
        .order('datetime', { ascending: true });

    if (error) handleError('getScheduleEntries', error);
    return (data as ScheduleEntry[]) || [];
};

export const deleteScheduleEntry = async (entryId: string): Promise<void> => {
    const { error } = await supabase
        .from('schedule')
        .delete()
        .eq('id', entryId);

    if (error) handleError('deleteScheduleEntry', error);
};
