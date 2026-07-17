import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { UserRole } from '@/types';

/**
 * PublicRoute ensures that authenticated users are redirected away
 * from public pages like Login and Register, straight to their dashboard.
 */
export function PublicRoute() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

/**
 * ProtectedRoute ensures that only authenticated users can access the route.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

interface RoleRouteProps {
  roles: UserRole[];
}

/**
 * RoleRoute ensures that the authenticated user has the required role.
 * MUST be nested under a ProtectedRoute.
 */
export function RoleRoute({ roles }: RoleRouteProps) {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user || !roles.includes(user.role as UserRole)) {
    // Redirect to a default dashboard if they don't have access to this specific role route
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
