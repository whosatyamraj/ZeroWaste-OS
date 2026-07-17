import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Leaf, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedPage } from '@/components/shared/AnimatedPage';

const schema = z.object({ email: z.string().email('Please enter a valid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    console.log('Reset password for:', data.email);
    await new Promise((r) => setTimeout(r, 1000));
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">ZeroWaste OS</span>
          </Link>

          <div className="glass-card p-8">
            {isSubmitSuccessful ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
                <p className="text-muted-foreground text-sm mb-6">
                  We&apos;ve sent a password reset link to your email address.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-foreground text-center mb-2">Forgot password?</h1>
                <p className="text-muted-foreground text-center mb-8 text-sm">
                  Enter your email and we&apos;ll send you a reset link
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="name@company.com" icon={<Mail className="w-4 h-4" />} {...register('email')} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <Link to="/login" className="text-sm text-accent hover:underline inline-flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
