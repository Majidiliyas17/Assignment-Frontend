'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore, applyTheme } from '@/stores/theme';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'surface' | 'chrome';
  className?: string;
}

export function ThemeToggle({ variant = 'surface', className }: ThemeToggleProps) {
  const theme = useThemeStore((store) => store.theme);
  const toggleTheme = useThemeStore((store) => store.toggleTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    applyTheme(useThemeStore.getState().theme);
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
        variant === 'chrome'
          ? 'text-sidebar-muted hover:bg-white/10 hover:text-white'
          : 'text-content-muted hover:bg-zinc-100 hover:text-content',
        className,
      )}
    >
      {mounted ? (
        theme === 'dark' ? (
          <Sun className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4" aria-hidden="true" />
        )
      ) : (
        <span className="block h-4 w-4" aria-hidden="true" />
      )}
      {mounted && (
        <span className="sr-only">
          {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        </span>
      )}
    </button>
  );
}