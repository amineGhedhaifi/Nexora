const GRID_MASK =
  "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 100%)";

export function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0 text-foreground/15"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: GRID_MASK,
          WebkitMaskImage: GRID_MASK,
        }}
      />
    </div>
  );
}
