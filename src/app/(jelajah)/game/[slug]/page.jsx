"use client";

import { useParams } from "next/navigation";
import { GameShell } from "@/components/games/GameShell";
import PowerMatch from "@/components/games/PowerMatch";
import JungleBridge from "@/components/games/JungleBridge";
import ExponentPuzzle from "@/components/games/ExponentPuzzle";
import MysteryChest from "@/components/games/MysteryChest";
import WrongOrRight from "@/components/games/WrongOrRight";
import RescueNaru from "@/components/games/RescueNaru";
import { GameButton } from "@/components/ui/GameButton";
import { Parchment } from "@/components/ui/Panels";
import { getGame } from "@/data/games";

const COMPONENTS = {
  "power-match": PowerMatch,
  "jungle-bridge": JungleBridge,
  "exponent-puzzle": ExponentPuzzle,
  "mystery-chest": MysteryChest,
  "wrong-or-right": WrongOrRight,
  "rescue-naru": RescueNaru,
};

export default function GamePage() {
  const { slug } = useParams();
  const meta = getGame(slug);
  const C = COMPONENTS[slug];
  if (!meta || !C) {
    return (
      <div className="mx-auto max-w-md p-6">
        <Parchment className="text-center text-jungle">
          Permainan tidak ditemukan.
          <GameButton href="/game" className="mt-3">
            Lihat semua game
          </GameButton>
        </Parchment>
      </div>
    );
  }
  return <GameShell meta={meta} Game={C} />;
}
