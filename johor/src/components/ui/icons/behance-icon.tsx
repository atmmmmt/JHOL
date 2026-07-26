import type { SVGProps } from "react";

function BehanceIcon({ className }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6h4.8a2.7 2.7 0 0 1 0 5.4H3z" />
      <path d="M3 11.4h5.4a3 3 0 0 1 0 6H3z" />
      <path d="M14.5 7.5h5" />
      <path d="M14 15.2h6a3 3 0 0 0-6 0v.4a3 3 0 0 0 5.3 1.9" />
    </svg>
  );
}

export default BehanceIcon;
