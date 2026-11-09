import type { ReactNode } from "react";
import type { DrawingId } from "@/content/products";

/*
 * Technical illustrations of each tool type, drawn as simplified engineering drawings:
 * outlines (.o), thin lines (.t), centre lines (.c), dimensions (.d) and cutting edges (.edge).
 * Letters (L, W, T…) are symbolic — no real dimensions are implied.
 */

function Dim({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g>
      <g className="d">
        <line x1={x1} y1={y} x2={x2} y2={y} />
        <path d={`M${x1 - 3} ${y + 3}l6 -6M${x2 - 3} ${y + 3}l6 -6`} />
        <line x1={x1} y1={y - 8} x2={x1} y2={y + 4} />
        <line x1={x2} y1={y - 8} x2={x2} y2={y + 4} />
      </g>
      <text x={(x1 + x2) / 2} y={y - 4} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

function VDim({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  return (
    <g>
      <g className="d">
        <line x1={x} y1={y1} x2={x} y2={y2} />
        <path d={`M${x - 3} ${y1 + 3}l6 -6M${x - 3} ${y2 + 3}l6 -6`} />
        <line x1={x - 8} y1={y1} x2={x + 4} y2={y1} />
        <line x1={x - 8} y1={y2} x2={x + 4} y2={y2} />
      </g>
      <text x={x + 7} y={(y1 + y2) / 2 + 3}>
        {label}
      </text>
    </g>
  );
}

function Hole({ cx, cy, r = 4, cb = true }: { cx: number; cy: number; r?: number; cb?: boolean }) {
  return (
    <g>
      {cb && <circle className="t" cx={cx} cy={cy} r={r + 3} />}
      <circle className="o" cx={cx} cy={cy} r={r} />
      <path className="c" d={`M${cx - r - 6} ${cy}h${2 * r + 12}M${cx} ${cy - r - 6}v${2 * r + 12}`} />
    </g>
  );
}

function Hatched({ d }: { d: string }) {
  return (
    <g>
      <path className="solid" d={d} />
      <path d={d} fill="url(#hatch)" stroke="none" />
    </g>
  );
}

function Notes({ x, y, lines }: { x: number; y: number; lines: string[] }) {
  return (
    <g>
      {lines.map((l, i) => (
        <text key={l} x={x} y={y + i * 13}>
          {l}
        </text>
      ))}
    </g>
  );
}

const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}Z`;

/** Circular cutter face with keyed bore, shared by the trimming and slitting cutters. */
function CutterFace() {
  return (
    <>
      <circle className="o" cx="96" cy="100" r="72" />
      <circle className="edge" cx="96" cy="100" r="72" />
      <path className="o" d="M86 76V68h20v8A26 26 0 1 1 86 76Z" />
      <path className="c" d="M14 100h164M96 18v164" />
    </>
  );
}

const drawings: Record<DrawingId, () => ReactNode> = {
  "shear-blade": () => (
    <>
      <rect className="o" x="20" y="34" width="280" height="46" />
      <path className="edge" d="M20 34H300" />
      <path className="c" d="M10 57H310" />
      {[45, 91, 137, 183, 229, 275].map((x) => (
        <Hole key={x} cx={x} cy={57} />
      ))}
      <path className="t" d="M160 24v6M160 84v6" />
      <text x="164" y="28">A</text>
      <Dim x1={20} x2={300} y={102} label="L" />
      <Hatched d={rect(40, 126, 24, 46)} />
      <path className="edge" d="M40 132v-6h6M58 126h6v6" />
      <VDim x={78} y1={126} y2={172} label="W" />
      <Dim x1={40} x2={64} y={190} label="T" />
      <Notes x={112} y={138} lines={["SECTION A–A", "STRAIGHT OR CUSTOM PROFILE", "SIZE TO DRAWING OR SAMPLE"]} />
    </>
  ),
  "trimming-cutter": () => (
    <>
      <CutterFace />
      <Hatched d="M200 28H220L232 42V158L220 172H200Z" />
      <path className="edge" d="M220 28L232 42M220 172L232 158" />
      <path className="c" d="M190 100h52" />
      <VDim x={262} y1={28} y2={172} label="ØD" />
      <text x="216" y="192" textAnchor="middle">SECTION · PROFILE TO PART</text>
    </>
  ),
  "slitting-cutter": () => (
    <>
      <CutterFace />
      <Hatched d={`${rect(200, 28, 16, 50)}${rect(200, 122, 16, 50)}`} />
      <path className="edge" d="M200 28h16M200 172h16" />
      <path className="c" d="M190 100h40" />
      <VDim x={250} y1={28} y2={172} label="ØD" />
      <Dim x1={200} x2={216} y={190} label="T" />
    </>
  ),
  punch: () => (
    <>
      <path className="o" d="M20 60H50V78H210L230 88H290V112H230L210 122H50V140H20Z" />
      <path className="t" d="M50 78V122M210 78V122M230 88V112" />
      <path className="edge" d="M290 88V112" />
      <path className="c" d="M10 100H310" />
      <Dim x1={20} x2={290} y={166} label="L" />
      <VDim x={300} y1={88} y2={112} label="d" />
      <Notes x={20} y={30} lines={["HARDENED PIERCING PUNCH", "POINT SIZE AND SHAPE TO DRAWING"]} />
    </>
  ),
  stamp: () => (
    <>
      <path className="o" d="M20 50H200L230 40V100L200 90H20Z" />
      <path className="t" d="M200 50V90" />
      <path className="edge" d="M230 40V100" />
      <path className="c" d="M10 70H240" />
      <Dim x1={20} x2={230} y={122} label="L" />
      <rect className="o" x="258" y="40" width="44" height="60" />
      <text x="280" y="75" textAnchor="middle">
        07
      </text>
      <text x="280" y="116" textAnchor="middle">
        FACE
      </text>
      <Notes x={20} y={152} lines={["MARKING, NUMBERING OR CODING", "CHARACTERS TO YOUR SPECIFICATION"]} />
    </>
  ),
};

export function ToolDrawing({ id, title, className = "" }: { id: DrawingId; title: string; className?: string }) {
  return (
    <svg className={`dwg ${className}`} viewBox="0 0 320 200" role="img" aria-label={`Technical illustration: ${title}`}>
      {drawings[id]()}
    </svg>
  );
}
