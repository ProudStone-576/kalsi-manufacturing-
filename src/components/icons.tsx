import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6 } as const;

export const SearchIcon = (p: P) => (
  <svg aria-hidden {...base} {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21" />
  </svg>
);
export const ArrowRight = (p: P) => (
  <svg aria-hidden {...base} width={16} height={16} className="arrow" {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);
export const MenuIcon = (p: P) => (
  <svg aria-hidden {...base} {...p}>
    <path d="M3 7h18M3 12h18M3 17h18" />
  </svg>
);
export const CloseIcon = (p: P) => (
  <svg aria-hidden {...base} {...p}>
    <path d="M5 5l14 14M19 5 5 19" />
  </svg>
);
export const ListIcon = (p: P) => (
  <svg aria-hidden {...base} {...p}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" strokeWidth={2.4} strokeLinecap="round" />
  </svg>
);
export const PlusIcon = (p: P) => (
  <svg aria-hidden {...base} width={16} height={16} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const CheckIcon = (p: P) => (
  <svg aria-hidden {...base} width={16} height={16} {...p}>
    <path d="M4 12.5 9.5 18 20 6.5" />
  </svg>
);
export const TrashIcon = (p: P) => (
  <svg aria-hidden {...base} width={16} height={16} {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
);
export const UploadIcon = (p: P) => (
  <svg aria-hidden {...base} width={24} height={24} {...p}>
    <path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4" />
  </svg>
);
export const AlertIcon = (p: P) => (
  <svg aria-hidden {...base} width={16} height={16} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.5v.01" strokeLinecap="round" />
  </svg>
);
export const PhoneIcon = (p: P) => (
  <svg aria-hidden {...base} {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />
  </svg>
);
export const MailIcon = (p: P) => (
  <svg aria-hidden {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" />
    <path d="m3 6 9 7 9-7" />
  </svg>
);

/** Brand mark: a square stock section cut by a raked blade line. */
export function BrandMark({ className = "brand__mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 34 34" aria-hidden="true">
      <rect x="1" y="1" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 22 33 12 33 1 1 1Z" fill="currentColor" />
      <path d="M1 25.5 33 15.5" stroke="#22508e" strokeWidth="2" />
    </svg>
  );
}

/** Shared SVG definitions (section hatching) referenced by every drawing on the page. */
export function DrawingDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
        </pattern>
      </defs>
    </svg>
  );
}
