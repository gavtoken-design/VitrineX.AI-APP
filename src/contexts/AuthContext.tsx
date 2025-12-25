import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';
import { getUserProfile } from '../services/core/db';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<void>;
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
            // Check for mock session first
            // Safe check using centralized config
            if (!isSupabaseConfigured && localStorage.getItem('mock_session')) {
                const mockUser: User = {
                    id: 'mock-user-123',
                    app_metadata: {},
                    user_metadata: { full_name: 'Usuário Demo' },
                    aud: 'authenticated',
                    created_at: new Date().toISOString(),
                };
                setUser(mockUser);
                setSession({
                    access_token: 'mock-token',
                    refresh_token: 'mock-refresh',
                    expires_in: 3600,
                    token_type: 'bearer',
                    user: mockUser
                });
                setLoading(false);
                return;
            }

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
                // Silently handle offline mode but log for dev
                console.error('Auth initialization error:', err);
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes safely
        let subscription: { unsubscribe: () => void } | null = null;
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
            if (subscription) subscription.unsubscribe();
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

    const signIn = async (email: string, password: string) => {
        if (!isSupabaseConfigured) {
            // Mock Login for development/demo
            console.log('Mode: Mock Login');
            const mockUser: User = {
                id: 'mock-user-123',
                app_metadata: {},
                user_metadata: { full_name: 'Usuário Demo' },
                aud: 'authenticated',
                created_at: new Date().toISOString(),
            };
            setUser(mockUser);
            setSession({
                access_token: 'mock-token',
                refresh_token: 'mock-refresh',
                expires_in: 3600,
                token_type: 'bearer',
                user: mockUser
            });
            // Persist mock session
            localStorage.setItem('mock_session', 'true');
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
        if (!isSupabaseConfigured) {
            // Mock Signup
            console.log('Mode: Mock Signup');
            const mockUser: User = {
                id: 'mock-user-123',
                app_metadata: {},
                user_metadata: metadata || { full_name: 'Usuário Demo' },
                aud: 'authenticated',
                created_at: new Date().toISOString(),
            };
            setUser(mockUser);
            setSession({
                access_token: 'mock-token',
                refresh_token: 'mock-refresh',
                expires_in: 3600,
                token_type: 'bearer',
                user: mockUser
            });
            localStorage.setItem('mock_session', 'true');
            return;
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });
        if (error) throw error;
    };

    const signOut = async () => {
        const hasSupabase = import.meta.env.VITE_SUPABASE_URL;

        if (!hasSupabase) {
            setUser(null);
            setSession(null);
            setProfile(null);
            localStorage.removeItem('mock_session');
            return;
        }
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut }}>
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
