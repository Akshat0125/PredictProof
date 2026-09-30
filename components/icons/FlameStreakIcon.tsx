import React from "react";

export function FlameStreakIcon({
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
      <path d="M8.5 14.5A3.5 3.5 0 0 0 12 18a3.5 3.5 0 0 0 3.5-3.5c0-2-1.5-3.5-2.5-5-.5 1-1 1.5-1.5 1.5s-.5-.5-.5-1C10 7.5 12 4 12 2c-3.5 2.5-6 6.5-6 10a6 6 0 0 0 2.5 2.5z" />
      <path d="M12 14a1.5 1.5 0 0 1-1.5-1.5c0-.8.7-1.5 1.5-2.5.8 1 1.5 1.7 1.5 2.5A1.5 1.5 0 0 1 12 14z" fill="currentColor" stroke="none" opacity="0.6" />
    </svg>
  );
}
