'use client';

import { AppShell } from '@/components/layout/AppShell';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { UploadDialog } from '@/components/files/UploadDialog';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
      <UploadDialog />
      <CommandPalette />
    </AppShell>
  );
}