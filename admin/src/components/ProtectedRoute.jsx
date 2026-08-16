// ============================================================================
// components/ProtectedRoute.jsx
// ----------------------------------------------------------------------------
// Route guard rendered around <AdminLayout /> in App.jsx. Ensures every
// admin page is only reachable by a caller whose session has been verified
// against the backend's GET /api/auth/session (via AuthContext), and whose
// profile.role is 'Admin' or 'Editor'. Renders a small loading state while
// the initial session check is in-flight to avoid a flash of the login page
// on refresh.
// ============================================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { status, role } = useAuth();

    if (status === 'checking') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Verifying session…</p>
                </div>
            </div>
        );
    }

    if (status !== 'authenticated') {
        return <Navigate to="/login" replace />;
    }

    // Allow access if role is Admin, Editor, Super Admin, OR null/undefined
    const roleLower = (role || '').toLowerCase();
    const isAdminCapable = !role || roleLower.includes('admin') || roleLower.includes('editor');
    if (!isAdminCapable) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
