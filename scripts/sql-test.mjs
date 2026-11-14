/**
 * Uji skema SQL tanpa proyek Supabase: menjalankan schema.sql + seed.sql di PGlite
 * (PostgreSQL WASM) dengan stub skema "auth", lalu memanggil fungsi RPC sebagai siswa.
 * Jalankan: node scripts/sql-test.mjs
 */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const db = new PGlite();
process.on("unhandledRejection", (e) => {
  console.error("SQL ERROR:", e?.message, e?.position ? `(posisi ${e.position})` : "", e?.where ?? "");
  process.exit(1);
});
const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
let pass = 0, fail = 0;
const check = (name, ok, extra = "") => {
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`);
};

// stub Supabase: role, skema auth, auth.uid()
await db.exec(`
  create role anon; create role authenticated;
  create schema auth;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.uid', true), '')::uuid $$;
  grant usage on schema public, auth to authenticated, anon;
  grant select on all tables in schema public to authenticated;
`);
await db.exec(read("../supabase/schema.sql"));
await db.exec(`grant select on all tables in schema public to authenticated; revoke all on public.quiz_answer_keys from authenticated;`);
await db.exec(read("../supabase/seed.sql"));
check("schema.sql + seed.sql berjalan tanpa error", true);

const U = "11111111-1111-1111-1111-111111111111";
const V = "22222222-2222-2222-2222-222222222222";
await db.query(`insert into auth.users values ($1, 'a@x.id', '{"full_name":"Dimas Pratama","username":"dimas","kelas":"VIII A"}'), ($2, 'b@x.id', '{"full_name":"Sari","username":"dimas","kelas":"VIII B"}')`, [U, V]);
const prof = await db.query(`select username, nickname, kelas from profiles order by username`);
check("trigger membuat profil + username unik", prof.rows.length === 2 && prof.rows.some((r) => r.username === "dimas") && prof.rows.some((r) => r.username.startsWith("penjelajah_")), JSON.stringify(prof.rows));

const as = async (uid, sql, params = []) => {
  await db.exec(`set request.uid = '${uid}'; set role authenticated;`);
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec(`reset role;`);
  }
};
const rpc = async (uid, sql, params) => (await as(uid, sql, params)).rows[0];

// kunci jawaban tidak bisa dibaca klien
let blocked = false;
try { await as(U, `select * from quiz_answer_keys limit 1`); } catch { blocked = true; }
check("kunci jawaban tidak bisa dibaca role authenticated", blocked);

check("username_available", (await rpc(U, `select username_available('dimas') as v`)).v === false && (await rpc(U, `select username_available('baru_123') as v`)).v === true);

// norm & grading
const g = async (id, ans) => (await db.query(`select jse_grade($1, $2::jsonb) as v`, [id, JSON.stringify(ans)])).rows[0].v;
check("server: pre-9 menerima '4 x 4 x 4' & '4.4.4'", (await g("pre-9", "4 x 4 x 4")) && (await g("pre-9", "4.4.4")));
check("server: pre-9 menolak '64'", !(await g("pre-9", "64")));
check("server: pre-10 menerima '2³', '2^{3}', '2 pangkat 3'", (await g("pre-10", "2³")) && (await g("pre-10", "2^{3}")) && (await g("pre-10", "2 pangkat 3")));
check("server: pre-10 menolak '2^4'", !(await g("pre-10", "2^4")));
check("server: nilai pecahan setara (m6-2: 2/50 = 1/25)", await g("m6-2", "2/50"));
check("server: mcq & match", (await g("pre-1", 1)) && !(await g("pre-1", 0)) && (await g("l1-term", { 0: 0, 1: 1, 2: 2, 3: 3 })) && !(await g("l1-term", { 0: 1, 1: 0, 2: 2, 3: 3 })));

// alur siswa
let err = "";
try { await rpc(U, `select submit_quiz('mission', '1', '{}'::jsonb) as r`); } catch (e) { err = e.message; }
check("misi ditolak sebelum pretest", /pretest/i.test(err), err);

const preAns = { "pre-1": 1, "pre-2": 2, "pre-3": 2, "pre-4": 0, "pre-5": 2, "pre-6": 1, "pre-7": 1, "pre-8": 0, "pre-9": "4×4×4", "pre-10": "2^3" };
const ex = (await rpc(U, `select submit_exam('pretest', $1::jsonb, now()) as r`, [JSON.stringify(preAns)])).r;
check("submit_exam pretest: skor 90, tanpa XP", ex.score === 90 && ex.correct === 9 && ex.xp_awarded === 0, JSON.stringify({ s: ex.score, xp: ex.xp_awarded }));

let cr = (await rpc(U, `select complete_region(1) as r`)).r;
check("complete_region ditolak sebelum materi dibaca", cr.ok === false, cr.reason);
for (const s of ["pembuka", "konsep", "rumus", "contoh", "waspada", "rangkuman"]) await as(U, `select mark_section(1, $1)`, [s]);
const mis = (await rpc(U, `select submit_quiz('mission', '1', $1::jsonb) as r`, [JSON.stringify({ "m1-1": 0, "m1-2": "5^2", "m1-3": "16", "m1-4": "base", "m1-5": false })])).r;
check("misi wilayah 1 dinilai server: 100", mis.score === 100 && mis.passed, JSON.stringify(mis));
cr = (await rpc(U, `select complete_region(1) as r`)).r;
check("complete_region 1 memberi 100 XP", cr.ok && cr.xp_awarded === 100, JSON.stringify(cr));
const cr2 = (await rpc(U, `select complete_region(1) as r`)).r;
const cr3 = (await rpc(U, `select complete_region(1) as r`)).r;
check("ulang wilayah: XP kecil sekali sehari, lalu 0", cr2.xp_awarded === 5 && cr3.xp_awarded === 0, `${cr2.xp_awarded}, ${cr3.xp_awarded}`);
const st = (await as(U, `select xp, gems, level from user_stats`)).rows;
check("user_stats hanya baris milik sendiri & XP = 105", st.length === 1 && st[0].xp === 105 && st[0].gems === 3, JSON.stringify(st));
check("lencana Langkah Pertama", (await as(U, `select * from user_achievements`)).rows.some((r) => r.achievement_id === "langkah-pertama"));

cr = (await rpc(U, `select complete_region(3) as r`)).r;
check("wilayah 3 ditolak (wilayah 2 belum selesai)", cr.ok === false, cr.reason);

let denied = false;
try { await as(U, `update user_stats set xp = 99999`); } catch { denied = true; }
const xpAfter = (await db.query(`select xp from user_stats where user_id = $1`, [U])).rows[0].xp;
check("siswa tidak bisa mengubah XP langsung", denied || xpAfter === 105, String(xpAfter));

const other = (await as(V, `select * from pretest_attempts`)).rows;
check("siswa lain tidak bisa melihat pretest siswa pertama", other.length === 0);

let postErr = "";
try { await rpc(U, `select submit_exam('posttest', '{}'::jsonb, now()) as r`); } catch (e) { postErr = e.message; }
check("posttest terkunci sebelum semua wilayah & challenge", /belum terbuka/.test(postErr), postErr);

const bank1 = (await db.query(`select id from quiz_questions where quiz_id = 'bank' and level = 1 limit 5`)).rows.map((r) => r.id);
let emptyErr = "";
try { await rpc(U, `select submit_quiz('practice', '1', $1::jsonb) as r`, [JSON.stringify(Object.fromEntries(bank1.map((id) => [id, null])))]); } catch (e) { emptyErr = e.message; }
check("latihan dengan jawaban kosong ditolak (tanpa XP)", /harus dijawab/.test(emptyErr), emptyErr);
const pr = (await rpc(U, `select submit_quiz('practice', '1', $1::jsonb) as r`, [JSON.stringify(Object.fromEntries(bank1.map((id) => [id, "0"])))])).r;
check("latihan selesai: XP penyelesaian pertama 60", pr.xp_awarded === 60 && pr.total === 5, JSON.stringify(pr));
let badQ = "";
try { await rpc(U, `select submit_quiz('practice', '1', $1::jsonb) as r`, [JSON.stringify({ "pre-1": 1, "pre-2": 2, "pre-3": 2, "pre-4": 0, "pre-5": 2 })]); } catch (e) { badQ = e.message; }
check("latihan menolak soal di luar bank/tingkat", /tidak valid/.test(badQ), badQ);

const ga = (await rpc(U, `select complete_activity('game', 'power-match', 90, true) as r`)).r;
check("game menang pertama +80 XP", ga.xp_awarded === 80);
for (const l of ["builder", "multiplier", "divider", "power", "zero-negative", "anatomy", "slider", "animation"]) await rpc(U, `select complete_activity('lab', $1, 100, true) as r`, [l]);
const state = (await rpc(U, `select get_my_state() as s`)).s;
check("get_my_state lengkap", state.profile.username === "dimas" && state.lab_tried.length === 8 && state.games_won[0] === "power-match" && state.pretests.length === 1 && state.regions.length >= 1, `xp=${state.stats.xp}`);
check("lencana Peneliti Laboratorium", (await as(U, `select * from user_achievements where achievement_id = 'peneliti-lab'`)).rows.length === 1);

// import tamu (akun kedua)
const imp = (await rpc(V, `select import_guest_progress($1::jsonb) as r`, [JSON.stringify({ journey: { explorer: { name: "Sari", avatar: "kupu" }, regions: { 1: { read: ["pembuka", "konsep", "rumus", "contoh", "waspada", "misi", "rangkuman"], missionBest: 80, completedAt: "2026-11-01" } }, gamesWon: ["jungle-bridge"], labTried: ["builder"] }, pretests: [{ answers: preAns, startedAt: "2026-11-01T00:00:00Z", finishedAt: "2026-11-01T00:10:00Z" }] })])).r;
const imp2 = (await rpc(V, `select import_guest_progress('{}'::jsonb) as r`)).r;
const vs = (await db.query(`select xp from user_stats where user_id = $1`, [V])).rows[0].xp;
check("impor tamu sekali, XP dihitung ulang server (100+80+10)", imp.imported && !imp2.imported && vs === 190, `xp=${vs}`);

console.log(`\n${pass}/${pass + fail} pemeriksaan SQL lulus`);
process.exit(fail ? 1 : 0);
