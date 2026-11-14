import { Footprints, Mushroom, TreasureChest, HangingVines, Fireflies } from "../scenery/Scenery";

/** Latar "gerbang hutan kuno" untuk pretest/posttest. */
export function ExamGate({ children, tone = "pre" }) {
  return (
    <div
      className="relative min-h-[calc(100dvh-64px)] overflow-hidden"
      style={{
        background:
          tone === "pre"
            ? "radial-gradient(ellipse at 50% 0%, #3f8a55 0%, #1f5536 45%, #173F2A 100%)"
            : "radial-gradient(ellipse at 50% 0%, #6b5a9a 0%, #2f3f5a 45%, #173F2A 100%)",
      }}
    >
      {/* pilar gerbang batu */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-16 bg-[repeating-linear-gradient(180deg,#8a826b_0_46px,#6f6853_46px_50px)] opacity-70 md:block lg:w-24"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-[repeating-linear-gradient(180deg,#8a826b_0_46px,#6f6853_46px_50px)] opacity-70 md:block lg:w-24"
        aria-hidden
      />
      <HangingVines count={8} seed={3} />
      <Fireflies count={8} />
      <Footprints className="pointer-events-none absolute bottom-6 left-6 w-20 opacity-60" />
      <Mushroom className="pointer-events-none absolute bottom-3 right-24 w-9" glow />
      <div className="pointer-events-none absolute bottom-2 right-4 hidden opacity-80 sm:block">
        <TreasureChest width={70} />
      </div>
      <div className="relative z-20 mx-auto max-w-3xl px-4 py-6 sm:py-10">{children}</div>
    </div>
  );
}
