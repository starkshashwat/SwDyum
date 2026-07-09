import { Navigate, useParams } from 'react-router-dom';

/**
 * Redirects legacy /orders/:id deep links to the new master-detail view
 * at /orders?order=<id> so existing bookmarks/links keep working.
 */
export default function OrderRedirect() {
    const { id } = useParams();
    return <Navigate to={`/orders?order=${id ?? ''}`} replace />;
}
