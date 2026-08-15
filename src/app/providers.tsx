'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useThemeStore } from '@/stores/theme';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  const theme = useThemeStore((store) => store.theme);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster theme={theme} position="bottom-right" richColors closeButton toastOptions={{ duration: 4000 }} />
    </QueryClientProvider>
  );
}