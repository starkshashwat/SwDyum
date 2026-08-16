// ============================================================================
// context/AuthContext.jsx
// ----------------------------------------------------------------------------
// Provides authentication state (user, profile, role) to the entire admin
// app, backed by the backend's /api/auth/* endpoints (NOT direct Supabase
// calls). Responsibilities:
//   - On mount, if a session is already persisted (see lib/apiClient.js),
//     verify it against GET /api/auth/session so stale/expired tokens don't
//     silently render protected pages.
//   - Expose `login(email, password)` which calls POST /api/auth/login,
//     persists the returned session, then fetches the profile via
//     GET /api/auth/session.
//   - Expose `logout()` which calls POST /api/auth/logout and clears the
//     local session regardless of the API call's outcome.
//   - Expose `profile.role` / `profile.admin_role` so pages/components can
//     make simple RBAC decisions (e.g. hide destructive actions from
//     non-Admin editors) without re-deriving this from raw Supabase data.
// ============================================================================

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient, getStoredSession, storeSession, clearStoredSession, setSessionRefreshHandler } from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // `status` avoids a flash of the login page while we verify a persisted
    // token on first load: 'checking' -> 'authenticated' | 'unauthenticated'.
    const [status, setStatus] = useState('checking');
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);

    const verifySession = useCallback(async () => {
        const stored = getStoredSession();
        if (!stored?.access_token) {
            setStatus('unauthenticated');
            return;
        }
        try {
            const data = await apiClient.get('/auth/session');
            setUser(data.user);
            setProfile(data.profile || null);
            
            // Sync session to Supabase JS client for direct DB queries
            await supabase.auth.setSession({
                access_token: stored.access_token,
                refresh_token: stored.refresh_token
            });
            
            setStatus('authenticated');
        } catch {
            // Token invalid/expired — apiClient already cleared storage on 401.
            clearStoredSession();
            setUser(null);
            setProfile(null);
            setStatus('unauthenticated');
        }
    }, []);

    useEffect(() => {
        verifySession();
    }, [verifySession]);

    // Keep apiClient armed with a session refresher so an expired access
    // token triggers one silent refresh+retry instead of a forced logout.
    useEffect(() => {
        setSessionRefreshHandler(async () => {
            try {
                const { data, error } = await supabase.auth.refreshSession();
                if (error || !data?.session?.access_token) return false;
                const stored = getStoredSession();
                storeSession({
                    ...stored,
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                    expires_at: data.session.expires_at,
                });
                return true;
            } catch {
                return false;
            }
        });
        return () => setSessionRefreshHandler(null);
    }, []);

    const login = useCallback(async (email, password) => {
        const data = await apiClient.post('/auth/login', { email, password });
        // data.session = { access_token, refresh_token, expires_at, ... }
        storeSession(data.session);
        // Fetch profile/role immediately so RBAC checks work right after login.
        const sessionData = await apiClient.get('/auth/session');
        setUser(sessionData.user);
        setProfile(sessionData.profile || null);
        
        // Sync session to Supabase JS client for direct DB queries
        await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
        });
        
        setStatus('authenticated');

        // Reject non-admin/editor roles at the client too (defense in depth —
        // requireAdmin on the backend is the real gate for every write, but
        // we shouldn't let a plain Customer account land in the admin UI).
        const role = sessionData.profile?.role;
        const roleLower = (role || '').toLowerCase();
        // A null/missing role must NOT grant admin access.
        const isAdminCapable = !!role && (roleLower.includes('admin') || roleLower.includes('editor'));
        if (!isAdminCapable) {
            clearStoredSession();
            setUser(null);
            setProfile(null);
            setStatus('unauthenticated');
            throw new Error('Access denied. Admin or Editor privileges required.');
        }

        return sessionData;
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiClient.post('/auth/logout');
            await supabase.auth.signOut();
        } catch {
            // Ignore — we clear local state regardless so the user is never
            // stuck unable to log out because of a network blip.
        } finally {
            clearStoredSession();
            setUser(null);
            setProfile(null);
            setStatus('unauthenticated');
        }
    }, []);

    const value = {
        status, // 'checking' | 'authenticated' | 'unauthenticated'
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

/** Hook for consuming auth state/actions anywhere in the admin app. */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
