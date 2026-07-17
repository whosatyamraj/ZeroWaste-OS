import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, type RegisterInput } from '../validation/authSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { Leaf } from 'lucide-react';
import apiClient from '@/services/apiClient';
import { useState } from 'react';
import { UserRole } from '@/types';

export function RegisterForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: UserRole.Customer,
    }
  });

  const selectedRole = watch('role');
  const needsBusinessName = [UserRole.FoodBusinessOwner, UserRole.NGOPartner].includes(selectedRole);

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const payload = { ...data };
      if (!needsBusinessName) {
        delete payload.businessName;
      }

      const response = await apiClient.post('/auth/register', payload);
      const { accessToken, refreshToken, user } = response.data.data;
      
      dispatch(setCredentials({ accessToken, refreshToken, user }));
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Create an account</h2>
        <p className="text-muted-foreground mt-2">Join ZeroWaste OS and make an impact.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register('firstName')} className={errors.firstName ? 'border-danger' : ''} />
            {errors.firstName && <p className="text-xs text-danger">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register('lastName')} className={errors.lastName ? 'border-danger' : ''} />
            {errors.lastName && <p className="text-xs text-danger">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} className={errors.email ? 'border-danger' : ''} />
          {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">I am registering as</Label>
          <select
            id="role"
            {...register('role')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value={UserRole.Customer}>Customer</option>
            <option value={UserRole.FoodBusinessOwner}>Food Business Owner</option>
            <option value={UserRole.NGOPartner}>NGO Partner</option>
            <option value={UserRole.Volunteer}>Volunteer</option>
          </select>
          {errors.role && <p className="text-xs text-danger">{errors.role.message}</p>}
        </div>

        {needsBusinessName && (
          <div className="space-y-2">
            <Label htmlFor="businessName">Organization / Business Name</Label>
            <Input id="businessName" {...register('businessName')} className={errors.businessName ? 'border-danger' : ''} />
            {errors.businessName && <p className="text-xs text-danger">{errors.businessName.message}</p>}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register('password')} className={errors.password ? 'border-danger' : ''} />
          {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" type="password" {...register('confirmPassword')} className={errors.confirmPassword ? 'border-danger' : ''} />
          {errors.confirmPassword && <p className="text-xs text-danger">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full h-11 mt-2" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Leaf className="w-4 h-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
