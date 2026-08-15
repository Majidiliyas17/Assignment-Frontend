import * as React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-indigo-600 to-indigo-700 text-primary-foreground shadow-sm shadow-indigo-600/20 hover:from-indigo-500 hover:to-indigo-600 active:from-indigo-700 active:to-indigo-800',
  secondary: 'bg-zinc-100 text-content hover:bg-zinc-200',
  outline:
    'border border-zinc-300 bg-card text-content shadow-sm hover:border-zinc-400 hover:bg-zinc-50 active:bg-zinc-100',
  ghost: 'text-content-muted hover:bg-zinc-100 hover:text-content',
  danger:
    'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-sm shadow-red-600/20 hover:from-red-400 hover:to-red-500 active:from-red-600 active:to-red-700',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-sm gap-2',
  icon: 'h-9 w-9',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex select-none items-center justify-center rounded-lg font-medium tracking-[-0.005em] transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100',
          'active:scale-[0.98]',
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...props}
      >
        {loading && <Spinner className="h-4 w-4 shrink-0" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';