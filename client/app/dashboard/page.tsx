"use client";

import { AppShell } from "@/components/layout/app-shell";
import { RepoDashboard } from "@/components/dashboard/repo-dashboard";
import { RequireAuth } from "@/components/providers/require-auth";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <AppShell hiddenHeader>
        <RepoDashboard />
      </AppShell>
    </RequireAuth>
  );
}
