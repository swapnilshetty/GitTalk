import Link from "next/link";

import { BrandMark } from "@/components/layout/app-shell";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(from_var(--primary)_l_c_h/0.1),transparent_55%)]"
      />

      <header className="relative z-10 flex h-14 items-center justify-between px-4">
        <Link href="/">
          <BrandMark />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Dashboard
          </Link>
          <ModeToggle />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <p className="text-sm font-medium text-primary">GitTalk</p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Your codebase, in conversation.
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Connect a GitHub repository and start exploring your codebase with
          AI-powered conversations.
        </p>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Open dashboard
        </Link>
      </main>
    </div>
  );
}
