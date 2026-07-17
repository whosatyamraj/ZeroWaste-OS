import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import type { User, UserRole } from '@/types';
import { setUser, logout as logoutAction, setLoading, setError } from '@/store/slices/authSlice';
import api from '@/lib/axios';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  const login = async (email: string, password: string) => {
    dispatch(setLoading(true));
    try {
      const response = await api.post('/auth/login', { email, password });
      dispatch(setUser(response.data.data.user));
      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      dispatch(setError(message));
      throw err;
    }
  };

  const register = async (data: { name: string; email: string; password: string; role: UserRole }) => {
    dispatch(setLoading(true));
    try {
      const response = await api.post('/auth/register', data);
      dispatch(setUser(response.data.data.user));
      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      dispatch(setError(message));
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      dispatch(logoutAction());
    }
  };

  const checkAuth = async () => {
    dispatch(setLoading(true));
    try {
      const response = await api.get('/auth/me');
      dispatch(setUser(response.data.data.user));
    } catch {
      dispatch(logoutAction());
    }
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const getDemoUser = (): User => ({
    id: '1',
    email: 'demo@zerowaste.io',
    name: 'Alex Johnson',
    role: 'RestaurantOwner',
    organization: 'Green Kitchen Co.',
    isVerified: true,
    avatar: '',
    createdAt: '2024-01-15',
    updatedAt: '2024-06-20',
  });

  return {
    user: user || getDemoUser(),
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    hasRole,
  };
}
