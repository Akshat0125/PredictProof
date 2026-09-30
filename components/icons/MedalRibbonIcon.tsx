import React from "react";

export function MedalRibbonIcon({
  className = "w-4 h-4",
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="8.5" r="5.5" />
      <path d="M8.2 13.5L7 21.5l5-2.5 5 2.5-1.2-8" />
      <circle cx="12" cy="8.5" r="2.5" opacity="0.6" />
    </svg>
  );
}
