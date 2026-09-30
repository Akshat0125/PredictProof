import React from "react";

export function MarketVolumeIcon({
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
      <line x1="6" y1="20" x2="6" y2="14" strokeWidth="2.5" />
      <line x1="12" y1="20" x2="12" y2="6" strokeWidth="2.5" />
      <line x1="18" y1="20" x2="18" y2="10" strokeWidth="2.5" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </svg>
  );
}
