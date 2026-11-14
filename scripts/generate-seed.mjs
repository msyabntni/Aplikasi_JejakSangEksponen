/**
 * Membuat supabase/seed.sql dari data TypeScript aplikasi (wilayah, soal, kunci,
 * game, lencana) supaya isi database selalu sama dengan aplikasi.
 * Jalankan: npm run seed:generate
 */
import { writeFileSync } from "node:fs";
import { REGIONS } from "../src/data/regions";
import { PRETEST, POSTTEST } from "../src/data/exams";
import { QUESTION_BANK } from "../src/data/questionBank";
import { GAMES } from "../src/data/games";
import { BADGES } from "../src/lib/gamification";

const q = (s) => `'${s.replace(/'/g, "''")}'`;
const j = (v) => `${q(JSON.stringify(v))}::jsonb`;

function payload(x) {
  const { id: _id, level: _l, indicator: _i, kind: _k, ...rest } = x;
  const p = { ...rest };
  // hapus semua informasi kunci dari payload publik
  delete p.answer;
  delete p.accept;
  delete p.wrongStep;
  delete p.target;
  delete p.explanation;
  delete p.optionFeedback;
  if (x.kind === "match") {
    // pasangan dipisah agar urutan kanan tidak membocorkan kunci
    delete p.pairs;
    p.left = x.pairs.map(([l]) => l);
    p.right = x.pairs.map(([, r]) => r).sort();
  }
  return p;
}

function key(x) {
  switch (x.kind) {
    case "mcq":
      return { mode: null, answer: x.answer };
    case "tf":
      return { mode: null, answer: x.answer };
    case "identify":
      return { mode: null, answer: x.target };
    case "findError":
      return { mode: null, answer: x.wrongStep };
    case "match":
      return { mode: null, answer: x.pairs.length };
    case "short":
      return { mode: x.mode, answer: x.accept };
  }
}

const out = [];
out.push("-- DIBUAT OTOMATIS oleh scripts/generate-seed.ts — jangan diedit manual.");
out.push("begin;");
out.push("insert into public.regions (id, code, name, title) values");
out.push(
  REGIONS.map((r) => `  (${r.id}, ${q(r.code)}, ${q(r.name)}, ${q(r.title)})`).join(",\n") +
    "\non conflict (id) do update set code = excluded.code, name = excluded.name, title = excluded.title;",
);
out.push("insert into public.games (id, title) values");
out.push(GAMES.map((g) => `  (${q(g.id)}, ${q(g.title)})`).join(",\n") + "\non conflict (id) do update set title = excluded.title;");
out.push("insert into public.achievements (id, name, description, optional) values");
out.push(
  BADGES.map((b) => `  (${q(b.id)}, ${q(b.name)}, ${q(b.desc)}, ${b.optional ? "true" : "false"})`).join(",\n") +
    "\non conflict (id) do update set name = excluded.name, description = excluded.description, optional = excluded.optional;",
);

const sets = [
  ["pretest", "pretest", PRETEST],
  ["posttest", "posttest", POSTTEST],
  ...REGIONS.map((r) => [`mission-${r.id}`, "mission", r.mission.questions]),
  ["bank", "bank", QUESTION_BANK],
];
out.push("insert into public.quizzes (id, kind) values");
out.push(sets.map(([id, kind]) => `  (${q(id)}, ${q(kind)})`).join(",\n") + "\non conflict (id) do nothing;");
out.push("delete from public.quiz_questions where quiz_id in (" + sets.map(([id]) => q(id)).join(", ") + ");");
for (const [quiz, , qs] of sets) {
  out.push("insert into public.quiz_questions (id, quiz_id, position, level, indicator, kind, payload) values");
  out.push(qs.map((x, i) => `  (${q(x.id)}, ${q(quiz)}, ${i}, ${x.level}, ${q(x.indicator)}, ${q(x.kind)}, ${j(payload(x))})`).join(",\n") + ";");
  out.push("insert into public.quiz_answer_keys (question_id, kind, mode, answer) values");
  out.push(
    qs
      .map((x) => {
        const k = key(x);
        return `  (${q(x.id)}, ${q(x.kind)}, ${k.mode ? q(k.mode) : "null"}, ${j(k.answer)})`;
      })
      .join(",\n") + ";",
  );
}
out.push("commit;");

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), out.join("\n") + "\n", "utf8");
console.log(`seed.sql dibuat: ${sets.reduce((t, [, , qs]) => t + qs.length, 0)} soal.`);
