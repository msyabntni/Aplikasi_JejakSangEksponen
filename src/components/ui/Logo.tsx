import { Compass } from "../scenery/Scenery";

export function Logo({ compact, light = true, hideTextOnMobile }: { compact?: boolean; light?: boolean; hideTextOnMobile?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Compass size={compact ? 30 : 38} />
      <span className={`leading-none ${hideTextOnMobile ? "hidden min-[430px]:block" : ""}`}>
        <span className={`block whitespace-nowrap font-display font-extrabold tracking-wide ${compact ? "text-base" : "text-xl sm:text-2xl"} ${light ? "text-sun" : "text-jungle"}`} style={{ textShadow: light ? "0 2px 0 #3e2718" : undefined }}>
          JEJAK SANG
        </span>
        <span className={`block font-display font-extrabold tracking-[0.18em] ${compact ? "text-sm" : "text-lg sm:text-xl"} ${light ? "text-cream" : "text-forest"}`}>
          EKSPONEN<sup className="text-orange">n</sup>
        </span>
      </span>
    </span>
  );
}
