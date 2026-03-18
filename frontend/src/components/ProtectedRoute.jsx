import { Navigate, Outlet } from 'react-router-dom';
import Loader from './Loader';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader text="Restoring your session" />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
}
