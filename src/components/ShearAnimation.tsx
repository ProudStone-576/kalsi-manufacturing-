/** Side view of a plate shear making one cut: hold-down clamps, upper blade passes the lower blade, off-cut drops. */
export function ShearAnimation() {
  return (
    <svg
      className="dwg shear-svg"
      viewBox="0 0 560 400"
      role="img"
      aria-label="Animated side view of a plate shear: the hold-down clamps the sheet, the upper blade passes the lower blade and the off-cut falls away."
    >
      <path className="c" d="M321 30V372" />

      {/* bed and lower blade */}
      <path className="solid" d="M40 262H300V340H40Z" />
      <path d="M40 262H300V340H40Z" fill="url(#hatch)" opacity="0.6" />
      <path className="solid" d="M300 262H320V306H300Z" />
      <path className="edge" d="M314 262H320V268" />

      {/* sheet, held part */}
      <path className="o" d="M60 250H321V262H60Z" />

      {/* off-cut */}
      <g className="offcut" style={{ transformBox: "fill-box", transformOrigin: "left top" }}>
        <path className="solid" d="M321 250H500V262H321Z" />
      </g>

      {/* hold-down */}
      <g className="holddown">
        <path className="t" d="M285 120V226" />
        <path className="o" d="M268 226H302V238H268Z" />
      </g>

      {/* ram with upper blade */}
      <g className="ram">
        <path className="o" d="M312 64H420V160H312Z" />
        <path d="M312 64H420V160H312Z" fill="url(#hatch)" opacity="0.35" />
        <path className="solid" d="M322 160H344V214H322Z" />
        <path className="edge" d="M322 208V214H328" />
        <path className="t" d="M330 64V30M404 64V30" />
      </g>

      {/* sparks at the cut */}
      <g className="spark" stroke="#d9c27a" strokeWidth="1.2">
        <path d="M324 262l18 10M324 262l14 18M324 262l22 3M324 262l8 20" />
      </g>

      {/* annotations */}
      <g className="d">
        <path d="M344 190H430" />
        <path d="M268 232H206" />
        <path d="M310 306V360H330" />
        <path d="M324 264L392 318" />
      </g>
      <text x="436" y="193">UPPER BLADE</text>
      <text x="200" y="235" textAnchor="end">HOLD-DOWN</text>
      <text x="336" y="363">LOWER BLADE</text>
      <text x="396" y="322">CLEARANCE</text>
      <g className="d">
        <path d="M52 250V262" />
        <path d="M47 250h10M47 262h10" />
      </g>
      <text x="22" y="259">t</text>
    </svg>
  );
}
