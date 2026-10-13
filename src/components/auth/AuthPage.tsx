import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ZenButton } from '@/components/ui/ZenButton';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { z } from 'zod';

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'Name too long'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

interface AuthPageProps {
  onBack?: () => void;
  onSuccess?: () => void;
  defaultMode?: 'signin' | 'signup';
}

export function AuthPage({ onBack, onSuccess, defaultMode = 'signup' }: AuthPageProps) {
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);

    const result = signUpSchema.safeParse({ firstName, email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, firstName);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        setMessage({ type: 'error', text: 'This email is already registered. Please sign in.' });
      } else {
        setMessage({ type: 'error', text: error.message });
      }
      return;
    }

    setMessage({ 
      type: 'success', 
      text: 'Check your email for a confirmation link to complete your registration.' 
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);

    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('Invalid login')) {
        setMessage({ type: 'error', text: 'Invalid email or password.' });
      } else if (error.message.includes('Email not confirmed')) {
        setMessage({ type: 'error', text: 'Please check your email to confirm your account.' });
      } else {
        setMessage({ type: 'error', text: error.message });
      }
      return;
    }

    onSuccess?.();
  };

  return (
    <div className="screen-container-scroll">
      {/* Header */}
      <div className="pt-6 pb-4 animate-fade-in">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        <h1 className="text-xl font-semibold text-foreground">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === 'signup' 
            ? 'Save your progress and access it anywhere' 
            : 'Sign in to continue your journey'}
        </p>
      </div>

      <form onSubmit={mode === 'signup' ? handleSignUp : handleSignIn} className="flex-1 flex flex-col">
        <div className="flex-1 space-y-5 animate-slide-up">
          {/* First name (signup only) */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                First name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10"
                  placeholder="Your first name"
                  autoComplete="given-name"
                />
              </div>
              {errors.firstName && (
                <p className="text-sm text-destructive mt-1">{errors.firstName}</p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password}</p>
            )}
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {/* Switch mode */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signup' ? 'signin' : 'signup');
                setMessage(null);
                setErrors({});
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === 'signup' 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pb-8 pt-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <ZenButton type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
              </span>
            ) : (
              mode === 'signup' ? 'Create account' : 'Sign in'
            )}
          </ZenButton>
        </div>
      </form>
    </div>
  );
}
