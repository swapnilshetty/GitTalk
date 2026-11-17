"use client";

import { RequireAuth } from "@/components/providers/require-auth";
import { AppShell } from "@/components/layout/app-shell";
import { OverviewDashboard } from "@/components/dashboard/overview-dashboard";

export default function OverviewPage() {
  return (
    <RequireAuth>
      <AppShell>
        <header>
          <h1>Overview</h1>
          <p>Workspace stats and recent repository activity</p>
        </header>
        <OverviewDashboard />
      </AppShell>
    </RequireAuth>
  );
}