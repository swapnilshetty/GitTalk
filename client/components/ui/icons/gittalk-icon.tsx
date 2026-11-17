import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

type GitTalkIconProps = SVGProps<SVGSVGElement> & {
  variant?: "color" | "mono";
};

export function GitTalkIcon({
  className,
  variant = "color",
  ...props
}: GitTalkIconProps) {
  const mono = variant === "mono";

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      {!mono && (
        <defs>
          <linearGradient
            id="gittalk-bg"
            x1="8"
            y1="4"
            x2="56"
            y2="60"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#6366F1" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      )}

      <rect
        width="64"
        height="64"
        rx="16"
        fill={mono ? "currentColor" : "url(#gittalk-bg)"}
      />

      <path
        d="M24 22 14 32l10 10"
        stroke={mono ? "var(--background, #fff)" : "#fff"}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 22 50 32 40 42"
        stroke={mono ? "var(--background, #fff)" : "#fff"}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M35 18 29 46"
        stroke={mono ? "var(--background, #fff)" : "#FDE68A"}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}