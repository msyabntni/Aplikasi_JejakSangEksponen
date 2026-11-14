import Naru from "../characters/Naru";
import { HangingVines, Fireflies } from "../scenery/Scenery";

/** Halaman loading bertema: Naru berayun di sulur. */
export function LoadingScreen({ text = "Naru sedang mencari jejak..." }: { text?: string }) {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#246B45,#173F2A_70%)]" role="status" aria-live="polite">
      <HangingVines count={6} />
      <Fireflies count={14} />
      <div className="flex flex-col items-center gap-3 text-center">
        <Naru pose="swing" width={150} />
        <p className="font-display text-xl font-bold text-cream">{text}</p>
        <div className="flex gap-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-3 w-3 animate-bob rounded-full bg-sun" style={{ animationDelay: `${i * 0.2}s`, animationDuration: "1s" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
