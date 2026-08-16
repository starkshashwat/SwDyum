import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [status, setStatus] = useState('checking'); // 'checking' | 'authenticated' | 'unauthenticated'
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);

    const loadProfile = async (sessionUser) => {
        if (!sessionUser) return null;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, email, role')
                .eq('id', sessionUser.id)
                .single();
            
            if (error) {
                console.error('Failed to load profile:', error);
                return null;
            }
            return data;
        } catch (err) {
            console.error('Exception loading profile:', err);
            return null;
        }
    };

    const verifySession = useCallback(async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session?.user) {
                setStatus('unauthenticated');
                setUser(null);
                setProfile(null);
                return;
            }

            const profileData = await loadProfile(session.user);
            setUser(session.user);
            setProfile(profileData);
            
            // Reject non-admin/editor roles at the client
            const role = profileData?.role;
            const roleLower = (role || '').toLowerCase();
            const isAdminCapable = !!role && (roleLower.includes('admin') || roleLower.includes('editor'));
            
            if (!isAdminCapable) {
                await supabase.auth.signOut();
                setUser(null);
                setProfile(null);
                setStatus('unauthenticated');
            } else {
                setStatus('authenticated');
            }
        } catch (err) {
            console.error('Session verification failed', err);
            setStatus('unauthenticated');
            setUser(null);
            setProfile(null);
        }
    }, []);

    useEffect(() => {
        verifySession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                setStatus('unauthenticated');
                setUser(null);
                setProfile(null);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                verifySession();
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [verifySession]);

    const login = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            throw new Error(error.message || 'Invalid login credentials.');
        }

        const profileData = await loadProfile(data.user);
        
        const role = profileData?.role;
        const roleLower = (role || '').toLowerCase();
        const isAdminCapable = !!role && (roleLower.includes('admin') || roleLower.includes('editor'));
        
        if (!isAdminCapable) {
            await supabase.auth.signOut();
            throw new Error('Access denied. Admin or Editor privileges required.');
        }

        setUser(data.user);
        setProfile(profileData);
        setStatus('authenticated');

        return { user: data.user, profile: profileData };
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setStatus('unauthenticated');
    }, []);

    const value = {
        status,
        user,
        profile,
        role: profile?.role || null,
        isAdmin: !!profile?.role && profile.role.toLowerCase().includes('admin'),
        isEditor: (profile?.role || '').toLowerCase().includes('editor'),
        login,
        logout,
        refreshSession: verifySession,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
