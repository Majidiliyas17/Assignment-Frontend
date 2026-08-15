'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin } from '@/hooks/useAuth';
import { extractApiError } from '@/lib/http';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email address is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login.mutateAsync(values);
      const target = next.startsWith('/') && next !== '/login' && next !== '/register' ? next : '/files';
      router.replace(target);
      router.refresh();
    } catch (err) {
      const apiError = extractApiError(err);
      if (apiError.code === 'INVALID_CREDENTIALS') {
        setFormError('Invalid email or password.');
      } else {
        setFormError(apiError.message);
      }
    }
  });

  return (
    <div>
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow">
          <ShieldCheck className="h-5 w-5 text-white" />
        </span>
        <span className="text-lg font-semibold tracking-tight text-content">SecureFiles</span>
      </div>

      <div className="mb-6">
        <h1 className="text-[1.6rem] font-semibold leading-snug tracking-tight text-content">Welcome back</h1>
        <p className="mt-1.5 text-[15px] text-content-muted">Sign in to access your secure file storage.</p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-content">
              Password
            </label>
            <span className="text-xs text-content-muted">Min. 1 character</span>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" aria-hidden="true">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              aria-invalid={errors.password ? true : undefined}
              className="input-focus h-11 w-full rounded-xl border border-zinc-300 bg-card pl-10 pr-10 text-[15px] text-content shadow-sm shadow-zinc-900/[0.03] placeholder:text-zinc-400"
              placeholder="••••••••"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-content-muted hover:text-content"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password?.message && (
            <p id="password-error" className="mt-1.5 text-xs text-danger">
              {errors.password.message}
            </p>
          )}
        </div>

        {formError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-danger">
            {formError}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" loading={login.isPending || isSubmitting}>
          Continue
          {!(login.isPending || isSubmitting) && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </form>

      <div className="my-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-zinc-200" aria-hidden="true" />
        <span className="text-xs text-content-muted">new here?</span>
        <span className="h-px flex-1 bg-zinc-200" aria-hidden="true" />
      </div>

      <Link
        href="/register"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-card text-[15px] font-medium text-content shadow-sm transition-colors hover:border-zinc-400 hover:bg-zinc-50"
      >
        Create an account
      </Link>

      <p className="mt-6 text-center text-sm text-content-muted">
        Protected by <span className="font-medium text-content">SecureFiles</span> — your files stay private.
      </p>
    </div>
  );
}