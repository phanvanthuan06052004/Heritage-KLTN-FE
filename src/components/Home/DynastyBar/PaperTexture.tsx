export function PaperTexture() {
  return (
    <>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
        style={{ mixBlendMode: "multiply" as React.CSSProperties["mixBlendMode"] }}
      >
        <filter id="paper-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="7" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.28  0 0 0 0.18 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-noise)" />
      </svg>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 15% 8%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(ellipse at 88% 92%, rgba(0,0,0,0.10), transparent 50%)",
        }}
      />
    </>
  );
}

export function GrainOverlay() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-50"
      style={{ mixBlendMode: "overlay" as React.CSSProperties["mixBlendMode"] }}
    >
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" opacity="0.35" />
    </svg>
  );
}
