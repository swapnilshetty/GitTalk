"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, LogOut } from "lucide-react";

import { GitTalkIcon } from "@/components/icons/gittalk-icon";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  dashboardNavGroups,
  isDashboardNavActive,
} from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 font-semibold tracking-tight",
        className,
      )}
    >
      <GitTalkIcon className="size-8 rounded-[10px]" />
      <span className="font-heading text-[1.05rem] leading-none group-data-[collapsible=icon]:hidden">
        GitTalk
      </span>
    </div>
  );
}

function AccountMenu() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex w-full items-center gap-3 rounded-xl p-2 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        aria-label="Open account menu"
      >
        <Avatar>
          {user?.avatarUrl && (
            <AvatarImage src={user.avatarUrl} alt={user.displayName} />
          )}
          <AvatarFallback>
            {user?.displayName.charAt(0).toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
          <span className="block truncate text-sm font-medium">
            {user?.githubUsername ?? "Account"}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {user ? "Connected via GitHub" : "Sign in to continue"}
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 group-data-[collapsible=icon]:hidden" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {user?.githubUsername ? `@${user.githubUsername}` : "Your account"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/settings" />}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!user || logout.isPending}
            onClick={() => logout.mutate()}
          >
            <LogOut />
            {logout.isPending ? "Signing out..." : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {logout.isError && (
          <>
            <DropdownMenuSeparator />
            <p className="px-3 py-2 text-xs text-destructive" role="alert">
              {logout.error instanceof Error
                ? logout.error.message
                : "Could not sign out. Please try again."}
            </p>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({
  children,
  hiddenHeader = false,
}: {
  children: ReactNode;
  hiddenHeader?: boolean;
}) {
  const pathname = usePathname();
  const activePage = dashboardNavGroups
    .flatMap((group) => group.items)
    .find((item) => isDashboardNavActive(pathname, item.href));

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <Link
            href="/dashboard"
            className="rounded-xl px-2 py-2 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <BrandMark />
            <span className="mt-1 block pl-10 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
              Your codebase, in conversation.
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          {dashboardNavGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isDashboardNavActive(
                      pathname,
                      item.href,
                    );

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.label}
                          render={<Link href={item.href} />}
                        >
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <AccountMenu />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        {!hiddenHeader && (
          <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <h1 className="flex-1 truncate text-sm font-medium">
              {activePage?.label ?? "Workspace"}
            </h1>
            <ModeToggle />
          </header>
        )}
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
