import { describe, expect, it } from "vitest";
import { formatRational, parseRational, powExact, rational, validateLabInput } from "./math/exponent";
import { gradeAll, gradeAnswer, normalizeText } from "./grading";
import { levelFor, rewardFor, REWARDS } from "./gamification";
import { migrate, emptySave } from "./storage/local";
import { PRETEST, POSTTEST } from "@/data/exams";
import { QUESTION_BANK, drawPractice } from "@/data/questionBank";
import { REGIONS } from "@/data/regions";
import { checkPuzzle, makePuzzles, CHEST_CLUES, WORKED_CASES } from "@/data/games";

const val = (b, e) => {
  const r = powExact(b, e);
  if (!r.ok) throw new Error(r.reason);
  return formatRational(r.value);
};

describe("perhitungan pangkat", () => {
  it("menghitung nilai positif, nol, negatif secara exact", () => {
    expect(val(2, 3)).toBe("8");
    expect(val(3, 2)).toBe("9");
    expect(val(2, 5)).toBe("32");
    expect(val(5, 0)).toBe("1");
    expect(val(2, -3)).toBe("1/8");
    expect(val(3, -2)).toBe("1/9");
    expect(val(-2, 3)).toBe("−8");
    expect(val(-2, 2)).toBe("4");
    expect(val(10, 3)).toBe("1.000");
    expect(val(10, -3)).toBe("1/1.000");
  });
  it("0^0 dan 0 pangkat negatif tidak terdefinisi", () => {
    expect(powExact(0, 0).ok).toBe(false);
    expect(powExact(0, -2).ok).toBe(false);
    expect(validateLabInput("0", "0").ok).toBe(false);
    expect(validateLabInput("0", "-1").error).toMatch(/tidak terdefinisi/);
  });
  it("validasi input laboratorium", () => {
    expect(validateLabInput("", "2").error).toMatch(/kosong/);
    expect(validateLabInput("a", "2").error).toMatch(/angka/);
    expect(validateLabInput("2", "1.5").error).toMatch(/bulat/);
    expect(validateLabInput("99", "2").error).toMatch(/dibatasi/);
    expect(validateLabInput("−3", "3").ok).toBe(true);
  });
  it("parsing jawaban nilai", () => {
    expect(parseRational("1/8")).toEqual(rational(1n, 8n));
    expect(parseRational("2/16")).toEqual(rational(1n, 8n));
    expect(parseRational("0,125")).toEqual(rational(1n, 8n));
    expect(parseRational("1.000")).toEqual(rational(1000n));
    expect(parseRational("abc")).toBeNull();
  });
});

describe("penilaian isian pretest", () => {
  const q9 = PRETEST[8];
  const q10 = PRETEST[9];
  it("no. 9 menerima variasi penulisan setara", () => {
    for (const a of ["4 × 4 × 4", "4x4x4", "4 * 4 * 4", "4.4.4", " 4 X 4 X 4 "]) expect(gradeAnswer(q9, a), a).toBe(true);
    for (const a of ["4 × 4", "64", "4 + 4 + 4", "4^3", "3 × 3 × 3 × 3"]) expect(gradeAnswer(q9, a), a).toBe(false);
  });
  it("no. 10 menerima bentuk pangkat setara", () => {
    for (const a of ["2^3", "2³", "2 ^ 3", "2^{3}", "2 pangkat 3"]) expect(gradeAnswer(q10, a), a).toBe(true);
    for (const a of ["2^4", "2^5", "3^2", "2^6"]) expect(gradeAnswer(q10, a), a).toBe(false);
  });
  it("kunci pretest sesuai spesifikasi (B C C A C B B C)", () => {
    expect(
      PRETEST.slice(0, 8)
        .map((q) => (q.kind === "mcq" ? "ABCD"[q.answer] : "?"))
        .join(""),
    ).toBe("BCCACBBC");
  });
  it("skor 0–100 dihitung benar", () => {
    const answers = {};
    PRETEST.forEach((q) => {
      if (q.kind === "mcq") answers[q.id] = q.answer;
      if (q.kind === "short") answers[q.id] = q.accept[0];
    });
    expect(gradeAll(PRETEST, answers).score).toBe(100);
    expect(gradeAll(PRETEST, {}).score).toBe(0);
    expect(normalizeText("2⁻³")).toBe("2^-3");
  });
  it("posttest sebanding dengan pretest", () => {
    expect(POSTTEST.length).toBe(PRETEST.length);
    POSTTEST.forEach((q, i) => {
      expect(q.indicator).toBe(PRETEST[i].indicator);
      expect(q.kind).toBe(PRETEST[i].kind);
    });
  });
});

/** Jawaban "kunci" untuk soal apa pun, lalu dipastikan dinilai benar. */
function keyAnswer(q) {
  switch (q.kind) {
    case "mcq":
      return q.answer;
    case "tf":
      return q.answer;
    case "short":
      return q.accept[0];
    case "identify":
      return q.target;
    case "findError":
      return q.wrongStep;
    case "match":
      return Object.fromEntries(q.pairs.map((_, i) => [i, i]));
  }
}

describe("integritas bank soal", () => {
  const all = [...QUESTION_BANK, ...REGIONS.flatMap((r) => r.mission.questions), ...PRETEST, ...POSTTEST];
  it("id soal unik", () => {
    const ids = all.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("cukup banyak soal per tingkat", () => {
    for (const l of [1, 2, 3]) expect(QUESTION_BANK.filter((q) => q.level === l).length).toBeGreaterThanOrEqual(15);
    expect(QUESTION_BANK.length).toBeGreaterThanOrEqual(90);
  });
  it("setiap kunci jawaban dinilai benar, opsi unik, dan ada pembahasan", () => {
    for (const q of all) {
      expect(gradeAnswer(q, keyAnswer(q)), q.id).toBe(true);
      expect(q.explanation.length, q.id).toBeGreaterThan(0);
      if (q.kind === "mcq") {
        expect(new Set(q.options).size, q.id).toBe(q.options.length);
        expect(q.options.length, q.id).toBeGreaterThanOrEqual(3);
      }
      if (q.kind === "short" && q.mode === "value") for (const a of q.accept) expect(parseRational(a), q.id).not.toBeNull();
    }
  });
  it("jawaban numerik generator benar secara matematis", () => {
    for (const q of QUESTION_BANK) {
      const m = q.kind === "short" && q.mode === "value" && q.prompt.match(/^Berapa nilai (\d+)\^\{(\d+)\}\?$/);
      if (m) expect(q.accept[0]).toBe(val(Number(m[1]), Number(m[2])).replace(/\./g, ""));
    }
  });
  it("drawPractice mengambil jumlah & tingkat yang diminta", () => {
    const qs = drawPractice(2, 10);
    expect(qs).toHaveLength(10);
    expect(qs.every((q) => q.level === 2)).toBe(true);
  });
});

describe("data permainan", () => {
  it("kode peti sesuai petunjuk", () => {
    const evalClue = (c) => {
      const js = c
        .replace(/\(([^()]+)\)\^\{(−?\d+)\}/g, "(($1)**$2)")
        .replace(/(\d+)\^\{(−?\d+)\}/g, "($1**$2)")
        .replace(/−/g, "-")
        .replace(/×/g, "*")
        .replace(/:/g, "/");
      return Function(`return ${js.replace(/\(\((\d+)\*\*(-?\d+)\)\*\*(-?\d+)\)/g, "(($1**$2)**$3)")}`)();
    };
    for (const c of CHEST_CLUES) expect(Math.round(evalClue(c.clue) * 1e9) / 1e9, c.clue).toBe(c.code);
  });
  it("teka-teki puzzle punya solusi benar", () => {
    for (let k = 0; k < 20; k++) for (const p of makePuzzles()) expect(checkPuzzle(p, p.values).ok).toBe(true);
  });
  it("kasus Wrong or Right valid", () => {
    for (const c of WORKED_CASES) expect(c.wrong).toBeLessThan(c.steps.length);
  });
});

describe("gamifikasi", () => {
  it("level sesuai ambang", () => {
    expect(levelFor(0).level).toBe(1);
    expect(levelFor(199).level).toBe(1);
    expect(levelFor(200).level).toBe(2);
    expect(levelFor(500).level).toBe(3);
    expect(levelFor(900).level).toBe(4);
    expect(levelFor(1400).level).toBe(5);
  });
  it("XP penyelesaian pertama hanya sekali; ulangan kecil maks. sekali sehari", () => {
    const ledger = [];
    const t1 = "2026-11-14T08:00:00.000Z";
    const a = rewardFor(ledger, "region:1", REWARDS.region, t1);
    expect(a.xp).toBe(100);
    ledger.push(a);
    const b = rewardFor(ledger, "region:1", REWARDS.region, t1);
    expect(b.repeat).toBe(true);
    expect(b.xp).toBe(REWARDS.repeat.xp);
    ledger.push(b);
    expect(rewardFor(ledger, "region:1", REWARDS.region, "2026-11-14T20:00:00.000Z")).toBeNull();
    expect(rewardFor(ledger, "region:1", REWARDS.region, "2026-11-15T08:00:00.000Z")?.xp).toBe(REWARDS.repeat.xp);
  });
});

describe("penyimpanan", () => {
  it("data rusak / kosong menghasilkan save kosong tanpa error", () => {
    expect(migrate(null)).toEqual(emptySave());
    expect(migrate("teks")).toEqual(emptySave());
    expect(migrate({ version: 2, journeys: "bukan array" }).journeys).toEqual([]);
  });
  it("migrasi v1 -> v2 mempertahankan identitas & progres", () => {
    const v1 = {
      version: 1,
      explorer: { name: "Dimas", kelas: "VIII A" },
      regions: { 1: { read: ["pembuka"], missionBest: 80 } },
      rewards: [{ key: "x", xp: 10, gems: 0, at: "", repeat: false }],
      pretests: [{ id: "p" }],
    };
    const s = migrate(v1);
    expect(s.version).toBe(2);
    expect(s.journeys).toHaveLength(1);
    expect(s.journeys[0].explorer.name).toBe("Dimas");
    expect(s.journeys[0].regions[1]?.missionBest).toBe(80);
    expect(s.activeJourneyId).toBe(s.journeys[0].id);
    expect(s.pretests).toHaveLength(1);
  });
});

describe("masuk dengan nama + kelas (tanpa password)", async () => {
  const { explorerKey } = await import("./store/ProgressProvider");
  const { validateKelas, validateName } = await import("./validation");
  it("nama & kelas dicocokkan tanpa peka huruf besar/kecil dan spasi", () => {
    expect(explorerKey("Dimas", "VIII A")).toBe(explorerKey("  dimas ", "viii-a"));
    expect(explorerKey("Dimas", "VIII A")).toBe(explorerKey("DIMAS", "VIIIA"));
    expect(explorerKey("Dimas", "VIII A")).not.toBe(explorerKey("Dimas", "VIII B"));
    expect(explorerKey("Dimas", "VIII A")).not.toBe(explorerKey("Dimas P", "VIII A"));
  });
  it("validasi nama & kelas wajib", () => {
    expect(validateName("")).toMatch(/belum diisi/);
    expect(validateKelas("")).toMatch(/belum diisi/);
    expect(validateKelas("VIII A")).toBeNull();
    expect(validateKelas("8/2")).toBeNull();
    expect(validateKelas("<script>")).toMatch(/hanya boleh/);
  });
  it("data lama tanpa daftar misi tetap terbaca (missions = [])", () => {
    const s = migrate({
      version: 2,
      activeJourneyId: "j",
      journeys: [{ id: "j", explorer: { name: "A", kelas: "VIII A" }, practice: [{ id: "x", score: 80 }] }],
    });
    expect(s.journeys[0].missions).toEqual([]);
    expect(s.journeys[0].practice).toHaveLength(1);
  });
});
