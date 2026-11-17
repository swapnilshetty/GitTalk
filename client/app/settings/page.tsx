"use client";

import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/components/providers/require-auth";
import { SettingsDashboard } from "@/components/dashboard/settings-dashboard";

export default function SettingsPage() {
  return (
    <RequireAuth>
      <AppShell>
        <SettingsDashboard />
      </AppShell>
    </RequireAuth>
  );
}
