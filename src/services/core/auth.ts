import { UserProfile, OrganizationMembership } from '../../types';
import { supabase } from '../../lib/supabase';

// Re-export methods for components that might use them directly, 
// though they should prefer AuthContext.
// Keeping interface compatible where possible.

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const loginWithGoogle = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin, // Redirect back to app
        }
    });

    if (error) {
        console.error('Error logging in with Google:', error);
        throw error;
    }
    // Session is handled by onAuthStateChange in AuthContext
};

export const loginWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

export const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

export const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error logging out:', error);
        throw error;
    }
};

export const getAuthToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
};

// Deprecated: Use AuthContext for current user
// Kept for compatibility during migration if needed, but updated logic.
export const getCurrentUser = async (): Promise<UserProfile | null> => {
    // This is better served by AuthContext which caches profile.
    // If called directly, we fetch.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Import dynamically to avoid circular deps if any, or just import db.
    // Ideally moved to db.ts, but keeping here for now.
    const { getUserProfile } = await import('./db');
    return getUserProfile(user.id);
};

// Mock organizations for now until we have an 'organizations' table
// or 'memberships' table in Supabase.
// Assuming we start with "Single User" organization for MVP.
export const getActiveOrganization = (): OrganizationMembership => {
    return {
        organization: {
            id: 'default-org',
            name: 'Minha Organização',
        },
        role: 'ADMIN'
    };
};

export const getActiveOrganizationId = (): string => {
    return 'default-org';
};
