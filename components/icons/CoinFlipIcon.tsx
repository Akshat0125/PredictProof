import React from "react";

export function CoinFlipIcon({
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
      {/* Primary binary prediction chip */}
      <circle cx="9" cy="13" r="6" />
      <path d="M7 11h4M9 11v4" />
      {/* Overlapping paired outcome coin */}
      <path d="M14.5 7.5A6 6 0 0 1 15 17" />
      <path d="M11 7.2A6 6 0 0 1 18 13" />
      {/* Subtle shine glint */}
      <path d="M18 4v3M19.5 5.5h-3" strokeWidth="1.75" />
    </svg>
  );
}
