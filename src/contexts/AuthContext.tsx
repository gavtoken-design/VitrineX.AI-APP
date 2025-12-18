import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { getUserProfile } from '../services/core/db';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (mounted) {
                    setSession(data.session);
                    setUser(data.session?.user ?? null);
                    if (data.session?.user) {
                        loadProfile(data.session.user.id);
                    } else {
                        setLoading(false);
                    }
                }
            } catch (err) {
                // Silently handle offline mode
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes safely
        let subscription: any = null;
        try {
            const { data } = supabase.auth.onAuthStateChange((_event, session) => {
                if (!mounted) return;
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    loadProfile(session.user.id);
                } else {
                    setProfile(null);
                    setLoading(false);
                }
            });
            subscription = data.subscription;
        } catch (e) {
            // Silently handle realtime error
        }

        return () => {
            mounted = false;
            if (subscription?.unsubscribe) subscription.unsubscribe();
        };
    }, []);

    const loadProfile = async (userId: string) => {
        try {
            const userProfile = await getUserProfile(userId);
            setProfile(userProfile);
        } catch (error) {
            console.error('Error loading user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        // State updates handled by onAuthStateChange
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
