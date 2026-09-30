import React from "react";

export function HexCheckIcon({
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
      <polygon points="12 2 21 7.2 21 16.8 12 22 3 16.8 3 7.2" />
      <polyline points="8 12 11 15 16 9" />
    </svg>
  );
}
