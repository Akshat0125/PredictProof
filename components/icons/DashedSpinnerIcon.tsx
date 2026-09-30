import React from "react";

export function DashedSpinnerIcon({
  className = "w-4 h-4",
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9" strokeDasharray="14 8" />
      <circle cx="12" cy="3" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="21" cy="12" r="1.2" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="12" cy="21" r="1" fill="currentColor" stroke="none" opacity="0.3" />
    </svg>
  );
}
