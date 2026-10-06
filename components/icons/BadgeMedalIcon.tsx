import React from "react";

export function BadgeMedalIcon({
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
      {/* Two ribbon tails hanging below bottom hexagon corners */}
      <path d="M7 14.1L5.5 21.5L7.5 20l2 1.5L9.5 15.6" />
      <path d="M14.5 15.6l0 5.9L16.5 20l2 1.5L17 14.1" />
      {/* Hexagonal badge outline */}
      <polygon points="12 2 19 6 19 13 12 17 5 13 5 6" />
      {/* Centered verification checkmark */}
      <polyline points="8.5 9.5 11 12 15.5 7.5" />
    </svg>
  );
}
