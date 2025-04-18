
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

const ProtectedRoute = ({ allowedRoles, redirectTo = '/login' }: ProtectedRouteProps) => {
  const { user, profile, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role access if roles are specified and profile is loaded
  if (allowedRoles && profile) {
    if (!allowedRoles.includes(profile.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
