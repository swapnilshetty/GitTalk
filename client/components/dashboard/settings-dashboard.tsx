"use client";

import { ExternalLink, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function SettingsDashboard() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your GitHub linked account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar size="lg" className="size-16">
                {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
                <AvatarFallback>{user?.displayName?.charAt(0)?.toUpperCase() ?? "U"}</AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="text-lg font-semibold text-foreground">
                  {user?.displayName ?? "GitHub user"}
                </p>
                <p className="text-sm text-muted-foreground">@{user?.githubUsername ?? "github-user"}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">GitHub ID</p>
                <p className="mt-2 text-sm font-medium">{user?.githubId ?? "-"}</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Access</p>
                <p className="mt-2 text-sm font-medium">GitHub connected</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {user?.githubUsername && (
                <a
                  href={`https://github.com/${encodeURIComponent(user.githubUsername)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "outline" })}
                >
                  <ExternalLink aria-hidden="true" />
                  View GitHub profile
                </a>
              )}
              <Button
                type="button"
                variant="destructive"
                className="gap-2"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                <LogOut className="size-4" />
                {logout.isPending ? "Signing out..." : "Sign out"}
              </Button>
            </div>
            {logout.isError && (
              <p className="text-sm text-destructive" role="alert">
                {logout.error instanceof Error
                  ? logout.error.message
                  : "Could not sign out. Please try again."}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Update how the workspace looks and behaves.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
                  {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
                </div>
                <div>
                  <p className="font-medium text-foreground">Dark mode</p>
                  <p className="text-xs text-muted-foreground">Switch between light and dark appearance</p>
                </div>
              </div>

              <Switch
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                aria-label="Toggle dark mode"
              />
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="font-medium text-foreground">Workspace sync</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Repositories are synced automatically when you open the dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
