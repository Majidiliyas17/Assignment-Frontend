'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRegister } from '@/hooks/useAuth';
import { extractApiError } from '@/lib/http';

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters long')
      .max(120, 'Name must be at most 120 characters long'),
    email: z.string().trim().toLowerCase().email('A valid email address is required').max(255, 'Email must be at most 255 characters long'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(72, 'Password must be at most 72 characters long')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const register = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await register.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      const target = next.startsWith('/') && next !== '/login' && next !== '/register' ? next : '/files';
      router.replace(target);
      router.refresh();
    } catch (err) {
      const apiError = extractApiError(err);
      if (apiError.code === 'EMAIL_ALREADY_REGISTERED') {
        setFormError('An account with this email already exists.');
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
        <h1 className="text-[1.6rem] font-semibold leading-snug tracking-tight text-content">Create your account</h1>
        <p className="mt-1.5 text-[15px] text-content-muted">Start storing your files securely in minutes.</p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <Input
          label="Full name"
          autoComplete="name"
          placeholder="Jane Doe"
          icon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          {...registerField('name')}
        />
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...registerField('email')}
        />
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-content">
            Password
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" aria-hidden="true">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              aria-invalid={errors.password ? true : undefined}
              className="input-focus h-11 w-full rounded-xl border border-zinc-300 bg-card pl-10 pr-10 text-[15px] text-content shadow-sm shadow-zinc-900/[0.03] placeholder:text-zinc-400"
              placeholder="8+ characters with symbols"
              {...registerField('password')}
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
          <p className="mt-1.5 text-xs text-content-muted">
            Use 8+ characters with uppercase, lowercase, number &amp; symbol.
          </p>
          {errors.password?.message && (
            <p id="password-error" className="mt-1.5 text-xs text-danger">
              {errors.password.message}
            </p>
          )}
        </div>
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          icon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          {...registerField('confirmPassword')}
        />

        {formError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-danger">
            {formError}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" loading={register.isPending || isSubmitting}>
          Create account
          {!(register.isPending || isSubmitting) && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-content-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
          Sign in
        </Link>
      </p>
    </div>
  );
}