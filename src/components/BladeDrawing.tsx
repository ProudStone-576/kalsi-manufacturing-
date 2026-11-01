import type { ReactNode } from "react";
import type { DrawingId } from "@/content/products";

/*
 * Technical illustrations of each blade type, drawn as simplified engineering drawings:
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

function Slot({ x, y, w = 26, h = 9 }: { x: number; y: number; w?: number; h?: number }) {
  return <rect className="o" x={x} y={y - h / 2} width={w} height={h} rx={h / 2} />;
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

function shredderPath(cx: number, cy: number, rIn: number, rOut: number, n: number): string {
  const step = (Math.PI * 2) / n;
  const pt = (r: number, a: number) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  let d = "";
  for (let k = 0; k < n; k++) {
    const a = k * step - Math.PI / 2;
    d += `${k === 0 ? "M" : "L"}${pt(rIn, a)} L${pt(rOut, a + step * 0.42)} L${pt(rOut * 0.9, a + step * 0.55)} `;
    d += `Q${pt(rIn * 1.02, a + step * 0.7)} ${pt(rIn, a + step)} `;
  }
  return d + "Z";
}

function hexPath(cx: number, cy: number, r: number): string {
  return (
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i;
      return `${i ? "L" : "M"}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    }).join(" ") + "Z"
  );
}

const drawings: Record<DrawingId, () => ReactNode> = {
  "straight-4edge": () => (
    <>
      <rect className="o" x="20" y="34" width="280" height="46" />
      <path className="edge" d="M20 34H300M20 80H300" />
      <path className="c" d="M10 57H310" />
      {[45, 91, 137, 183, 229, 275].map((x) => (
        <Hole key={x} cx={x} cy={57} />
      ))}
      <path className="t" d="M160 24v6M160 84v6" />
      <text x="164" y="28">A</text>
      <Dim x1={20} x2={300} y={102} label="L" />
      <Hatched d={rect(40, 126, 24, 46)} />
      <path className="edge" d="M40 132v-6h6M58 126h6v6M64 166v6h-6M46 172h-6v-6" />
      <VDim x={78} y1={126} y2={172} label="W" />
      <Dim x1={40} x2={64} y={190} label="T" />
      <Notes x={112} y={138} lines={["SECTION A–A", "FOUR CUTTING EDGES", "HOLE PATTERN TO SUIT SEAT"]} />
    </>
  ),
  "swing-beam": () => (
    <>
      <rect className="o" x="20" y="36" width="280" height="40" />
      <path className="edge" d="M20 76H300" />
      <path className="c" d="M10 56H310" />
      {[50, 105, 160, 215, 270].map((x) => (
        <Hole key={x} cx={x} cy={56} />
      ))}
      <Dim x1={20} x2={300} y={98} label="L" />
      <Hatched d="M40 122h22v38l-6 8H40Z" />
      <path className="edge" d="M56 168l6-8" />
      <VDim x={76} y1={122} y2={168} label="W" />
      <Notes x={112} y={134} lines={["UPPER BLADE · SECTION", "EDGES TO MACHINE DESIGN", "SEAT PROFILE TO SAMPLE"]} />
    </>
  ),
  section: () => (
    <>
      <path className="o" d="M60 30H124L150 70L176 30H260V140H60Z" />
      <path className="edge" d="M124 30L150 70L176 30" />
      <circle className="o" cx="214" cy="96" r="17" />
      <circle className="edge" cx="214" cy="96" r="17" />
      <path className="c" d="M190 96h48M214 72v48M150 20v62" />
      <Hole cx={86} cy={118} />
      <Hole cx={238} cy={124} r={3} cb={false} />
      <Dim x1={60} x2={260} y={162} label="B" />
      <VDim x={276} y1={30} y2={140} label="H" />
      <Notes x={60} y={186} lines={["PROFILE: ANGLE + ROUND · MATCHED SET"]} />
    </>
  ),
  "hot-crop": () => (
    <>
      <rect className="o" x="20" y="36" width="280" height="62" />
      <path className="t" d="M20 48H300" />
      <path className="edge" d="M20 36H300" />
      {[46, 112, 178, 244].map((x) => (
        <Slot key={x} x={x} y={76} w={30} />
      ))}
      <path className="c" d="M10 76H310" />
      <Dim x1={20} x2={300} y={118} label="L" />
      <Hatched d="M40 136h18l10 12v34H40Z" />
      <path className="edge" d="M58 136l10 12" />
      <VDim x={82} y1={136} y2={182} label="W" />
      <Notes x={118} y={146} lines={["SECTION · BEVELLED EDGE", "HOT-WORK GRADE", "SLOTS TO MILL DRAWING"]} />
    </>
  ),
  billet: () => (
    <>
      <rect className="o" x="20" y="30" width="200" height="100" />
      <path className="t" d="M20 112H220" />
      <path className="edge" d="M20 30H220" />
      <path className="c" d="M10 74H230" />
      {[55, 100, 145, 190].map((x) => (
        <Hole key={x} cx={x} cy={74} r={6} />
      ))}
      <Hatched d={rect(250, 30, 42, 100)} />
      <path className="edge" d="M250 38v-8h8M284 30h8v8" />
      <Dim x1={20} x2={220} y={150} label="L" />
      <Dim x1={250} x2={292} y={150} label="T" />
      <Notes x={20} y={176} lines={["HEAVY SECTION · TOUGHNESS THROUGH THE FULL SECTION"]} />
    </>
  ),
  bar: () => {
    const grooves = [56, 104, 152, 200, 248];
    let top = "M20 50";
    for (const g of grooves) top += ` H${g - 11} A11 11 0 0 0 ${g + 11} 50`;
    top += " H300";
    return (
      <>
        <path className="o" d={`${top} V120 H20 Z`} />
        <path className="edge" d={top} />
        <path className="c" d="M10 96H310" />
        {[80, 176, 272].map((x) => (
          <Hole key={x} cx={x} cy={96} />
        ))}
        <Dim x1={56} x2={104} y={34} label="P" />
        <Dim x1={20} x2={300} y={142} label="L" />
        <Notes x={20} y={170} lines={["GROOVE RADIUS AND PITCH TO BAR SIZES", "SINGLE OR MULTIPLE EDGES"]} />
      </>
    );
  },
  slitter: () => (
    <>
      <circle className="o" cx="96" cy="100" r="72" />
      <circle className="edge" cx="96" cy="100" r="72" />
      <path className="o" d="M86 76V68h20v8A26 26 0 1 1 86 76Z" />
      <path className="c" d="M14 100h164M96 18v164" />
      <Hatched d={`${rect(200, 28, 14, 46)}${rect(200, 126, 14, 46)}`} />
      <path className="edge" d="M200 28h14M200 172h14" />
      <path className="t" d={`${rect(230, 46, 22, 28)}${rect(230, 126, 22, 28)}`} />
      <path d={`${rect(230, 46, 22, 28)}${rect(230, 126, 22, 28)}`} fill="url(#hatch)" opacity="0.5" />
      <path className="c" d="M190 100h72" />
      <VDim x={276} y1={28} y2={172} label="ØD" />
      <text x="207" y="192" textAnchor="middle">KNIFE</text>
      <text x="241" y="192" textAnchor="start" dx="-6">SPACER</text>
    </>
  ),
  ctl: () => (
    <>
      <rect className="o" x="20" y="58" width="280" height="30" />
      <path className="edge" d="M20 58H300M20 88H300" />
      <path className="c" d="M10 73H310" />
      {[42, 81, 120, 159, 198, 237, 276].map((x) => (
        <Hole key={x} cx={x} cy={73} r={3} cb={false} />
      ))}
      <Dim x1={20} x2={300} y={110} label="L" />
      <Hatched d={rect(40, 134, 16, 30)} />
      <path className="edge" d="M40 139v-5h5M51 134h5v5M56 159v5h-5M45 164h-5v-5" />
      <VDim x={68} y1={134} y2={164} label="W" />
      <Notes x={104} y={144} lines={["SECTION", "TWO OR FOUR EDGES", "HOLES TO BLADE HOLDER"]} />
    </>
  ),
  alligator: () => (
    <>
      <path className="o" d="M40 44H280L296 60V92L280 108H40L24 92V60Z" />
      <path className="edge" d="M40 44H280M40 108H280" />
      <path className="c" d="M14 76H306" />
      {[70, 130, 190, 250].map((x) => (
        <Hole key={x} cx={x} cy={76} r={6} />
      ))}
      <Dim x1={24} x2={296} y={130} label="L" />
      <VDim x={306} y1={44} y2={108} label="W" />
      <Notes x={24} y={160} lines={["REVERSIBLE · USE EACH EDGE BEFORE REGRINDING", "BOLT PATTERN TO JAW SEAT"]} />
    </>
  ),
  shredder: () => (
    <>
      <path className="o" d={shredderPath(104, 100, 56, 80, 5)} />
      <path className="edge" d={shredderPath(104, 100, 56, 80, 5)} opacity="0.55" />
      <path className="o" d={hexPath(104, 100, 20)} />
      <path className="c" d="M14 100h180M104 12v176" />
      <Hatched d={`${rect(228, 22, 20, 60)}${rect(228, 118, 20, 60)}`} />
      <path className="t" d="M228 82h20M228 118h20" />
      <Dim x1={228} x2={248} y={196} label="T" />
      <Notes x={258} y={60} lines={["HOOKS", "TO DESIGN"]} />
      <Notes x={258} y={136} lines={["HEX", "BORE"]} />
    </>
  ),
  granulator: () => (
    <>
      <rect className="o" x="20" y="54" width="280" height="44" />
      <path className="t" d="M20 66H300" />
      <path className="edge" d="M20 54H300" />
      {[48, 118, 188, 258].map((x) => (
        <Slot key={x} x={x - 6} y={84} w={24} />
      ))}
      <Dim x1={20} x2={300} y={118} label="L" />
      <Hatched d="M40 146L68 134V176H40Z" />
      <path className="edge" d="M60 137.5L68 134" />
      <VDim x={82} y1={134} y2={176} label="W" />
      <Notes x={118} y={146} lines={["SECTION · CUTTING ANGLE", "ROTOR AND BED KNIVES", "WEIGHT-MATCHED SETS"]} />
    </>
  ),
  paper: () => (
    <>
      <rect className="o" x="10" y="64" width="300" height="36" />
      <path className="t" d="M10 92H310" />
      <path className="edge" d="M10 100H310" />
      {[34, 82, 130, 178, 226, 274].map((x) => (
        <Slot key={x} x={x} y={78} w={18} h={7} />
      ))}
      <Dim x1={10} x2={310} y={48} label="L" />
      <Hatched d="M40 128H58V164L50 182H40Z" />
      <path className="solid" d="M50 182L58 164V172Z" />
      <path className="edge" d="M50 182L58 164" />
      <VDim x={72} y1={128} y2={182} label="W" />
      <Notes x={108} y={140} lines={["SECTION · BEVEL TO STOCK", "HARD INLAID CUTTING EDGE", "ON A TOUGHER BODY"]} />
    </>
  ),
};

export function BladeDrawing({ id, title, className = "" }: { id: DrawingId; title: string; className?: string }) {
  return (
    <svg className={`dwg ${className}`} viewBox="0 0 320 200" role="img" aria-label={`Technical illustration: ${title}`}>
      {drawings[id]()}
    </svg>
  );
}
