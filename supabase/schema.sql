-- ════════════════════════════════════════════════════════════════════
-- JEJAK SANG EKSPONEN — skema database mode akun (Supabase / PostgreSQL)
-- Jalankan file ini di Supabase SQL Editor, lalu jalankan seed.sql.
-- Prinsip:
--   • Identitas = UUID Supabase Auth (auth.users.id).
--   • Row Level Security aktif di semua tabel; siswa hanya melihat datanya sendiri.
--   • Kunci jawaban ada di tabel quiz_answer_keys yang TIDAK bisa dibaca klien.
--   • Skor & XP dihitung oleh fungsi SECURITY DEFINER, bukan dikirim frontend.
-- ════════════════════════════════════════════════════════════════════

-- gen_random_uuid() sudah bawaan PostgreSQL 13+ (Supabase memakai PostgreSQL 15+).

-- ───────────────────────── TABEL REFERENSI ─────────────────────────
create table if not exists public.regions (
  id smallint primary key check (id between 1 and 7),
  code text not null,
  name text not null,
  title text not null
);

create table if not exists public.games (
  id text primary key,
  title text not null
);

create table if not exists public.achievements (
  id text primary key,
  name text not null,
  description text not null,
  optional boolean not null default false
);

create table if not exists public.quizzes (
  id text primary key,                 -- 'pretest', 'posttest', 'mission-1'..'mission-7', 'bank'
  kind text not null check (kind in ('pretest', 'posttest', 'mission', 'bank'))
);

-- Soal tanpa kunci jawaban (boleh dibaca pengguna yang login)
create table if not exists public.quiz_questions (
  id text primary key,
  quiz_id text not null references public.quizzes(id) on delete cascade,
  position int not null default 0,
  level smallint not null check (level between 1 and 3),
  indicator text not null,
  kind text not null check (kind in ('mcq', 'tf', 'short', 'match', 'identify', 'findError')),
  payload jsonb not null               -- teks soal, opsi, langkah, dsb. (tanpa kunci)
);
create index if not exists quiz_questions_quiz_idx on public.quiz_questions(quiz_id, position);

-- Kunci jawaban: TIDAK ada policy SELECT → tidak bisa dibaca klien
create table if not exists public.quiz_answer_keys (
  question_id text primary key references public.quiz_questions(id) on delete cascade,
  kind text not null,
  mode text,                           -- 'text' | 'value' untuk isian
  answer jsonb not null                -- mcq/findError: int, tf: bool, identify: "base"/"exp", match: jumlah pasangan, short: array jawaban
);

-- ───────────────────────── TABEL PENGGUNA ─────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  nickname text not null default '' check (char_length(nickname) <= 24),
  kelas text not null default '' check (char_length(kelas) <= 12),
  avatar text not null default 'daun' check (avatar in ('daun','kompas','jamur','permata','kupu','bunga','kristal','gunung')),
  imported_guest boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp int not null default 0,
  gems int not null default 0,
  level smallint not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.region_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  region_id smallint not null references public.regions(id),
  read_sections text[] not null default '{}',
  mission_best smallint not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, region_id)
);

create table if not exists public.pretest_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  per_question jsonb not null,
  correct smallint not null,
  wrong smallint not null,
  score smallint not null check (score between 0 and 100),
  by_indicator jsonb not null default '{}',
  started_at timestamptz not null,
  finished_at timestamptz not null default now()
);
create index if not exists pretest_user_idx on public.pretest_attempts(user_id, finished_at);

create table if not exists public.posttest_attempts (like public.pretest_attempts including all);
alter table public.posttest_attempts
  drop constraint if exists posttest_attempts_user_id_fkey,
  add constraint posttest_attempts_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('mission', 'practice', 'challenge')),
  ref text not null,                   -- id wilayah / tingkat
  answers jsonb not null,
  per_question jsonb not null,
  correct smallint not null,
  total smallint not null,
  score smallint not null,
  passed boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists quiz_attempts_user_idx on public.quiz_attempts(user_id, kind, created_at);

create table if not exists public.game_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null references public.games(id),
  score smallint not null check (score between 0 and 100),
  won boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null references public.achievements(id),
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table if not exists public.activity_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_key text not null,          -- penanda unik aktivitas, mis. 'region:2', 'game:power-match'
  type text not null,                  -- jenis untuk riwayat
  title text not null,
  detail text,
  score smallint,
  status text not null default 'selesai',
  xp_awarded int not null default 0,
  gems_awarded int not null default 0,
  is_repeat boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists activity_user_idx on public.activity_logs(user_id, created_at);
-- XP penyelesaian pertama hanya sekali per aktivitas
create unique index if not exists activity_first_reward_uq
  on public.activity_logs(user_id, activity_key) where xp_awarded > 0 and not is_repeat;

-- ───────────────────────── ROW LEVEL SECURITY ─────────────────────────
alter table public.regions enable row level security;
alter table public.games enable row level security;
alter table public.achievements enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answer_keys enable row level security;
alter table public.profiles enable row level security;
alter table public.user_stats enable row level security;
alter table public.region_progress enable row level security;
alter table public.pretest_attempts enable row level security;
alter table public.posttest_attempts enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.game_attempts enable row level security;
alter table public.user_achievements enable row level security;
alter table public.activity_logs enable row level security;

-- referensi: boleh dibaca pengguna login
drop policy if exists "baca regions" on public.regions;
create policy "baca regions" on public.regions for select to authenticated using (true);
drop policy if exists "baca games" on public.games;
create policy "baca games" on public.games for select to authenticated using (true);
drop policy if exists "baca achievements" on public.achievements;
create policy "baca achievements" on public.achievements for select to authenticated using (true);
drop policy if exists "baca quizzes" on public.quizzes;
create policy "baca quizzes" on public.quizzes for select to authenticated using (true);
drop policy if exists "baca soal" on public.quiz_questions;
create policy "baca soal" on public.quiz_questions for select to authenticated using (true);
-- quiz_answer_keys: sengaja TANPA policy → tidak bisa dibaca/diubah klien
revoke all on public.quiz_answer_keys from anon, authenticated;

-- profil: baca & ubah milik sendiri (kolom yang boleh diubah dibatasi lewat GRANT)
drop policy if exists "profil sendiri - baca" on public.profiles;
create policy "profil sendiri - baca" on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists "profil sendiri - ubah" on public.profiles;
create policy "profil sendiri - ubah" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated;
grant update (nickname, kelas, avatar) on public.profiles to authenticated;

-- data progres: hanya BACA milik sendiri; penulisan hanya lewat fungsi SECURITY DEFINER
do $$
declare t text;
begin
  foreach t in array array['user_stats','region_progress','pretest_attempts','posttest_attempts','quiz_attempts','game_attempts','user_achievements','activity_logs'] loop
    execute format('drop policy if exists "baca milik sendiri" on public.%I', t);
    execute format('create policy "baca milik sendiri" on public.%I for select to authenticated using (user_id = auth.uid())', t);
    execute format('revoke insert, update, delete on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- ───────────────────────── PROFIL OTOMATIS ─────────────────────────
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_username text := lower(coalesce(new.raw_user_meta_data->>'username', ''));
begin
  if v_username !~ '^[a-z0-9_]{3,20}$' or exists (select 1 from public.profiles where username = v_username) then
    v_username := 'penjelajah_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  insert into public.profiles (id, full_name, username, nickname, kelas)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data->>'full_name', ''), 60),
    v_username,
    left(coalesce(nullif(new.raw_user_meta_data->>'nickname', ''), split_part(coalesce(new.raw_user_meta_data->>'full_name', 'Penjelajah'), ' ', 1)), 24),
    left(coalesce(new.raw_user_meta_data->>'kelas', ''), 12)
  );
  insert into public.user_stats (user_id) values (new.id);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.username_available(p_username text) returns boolean
language sql security definer set search_path = public stable as $$
  select not exists (select 1 from public.profiles where username = lower(trim(p_username)));
$$;
grant execute on function public.username_available(text) to anon, authenticated;

-- ───────────────────────── PENILAIAN ─────────────────────────
-- Normalisasi isian teks (setara dengan normalizeText di src/lib/grading.ts)
create or replace function public.jse_norm(raw text) returns text
language plpgsql immutable as $$
declare s text := lower(btrim(coalesce(raw, '')));
begin
  s := regexp_replace(s, '([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ᵐⁿ]+)', '^\1', 'g');
  s := translate(s, '⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ᵐⁿ', '0123456789-+mn');
  s := translate(s, '−–—', '---');
  s := regexp_replace(s, '\s*pangkat\s*', '^', 'g');
  s := regexp_replace(s, '\s+', '', 'g');
  s := translate(s, '×x*·•', '*****');
  if s ~ '^\d+(\.\d+){2,}$' then s := replace(s, '.', '*'); end if;
  s := translate(s, '÷:', '//');
  s := regexp_replace(s, '\^\{([^}]*)\}', '^\1', 'g');
  s := regexp_replace(s, '\^\((-?\w+)\)', '^\1', 'g');
  return s;
end $$;

-- Parsing jawaban nilai: "1/8", "0,125", "1.000" → {pembilang, penyebut}
create or replace function public.jse_rational(raw text) returns numeric[]
language plpgsql immutable as $$
declare s text := translate(regexp_replace(btrim(coalesce(raw, '')), '\s+', '', 'g'), '−–', '--');
        d numeric;
begin
  if s ~ '^-?\d+/-?\d+$' then
    d := split_part(s, '/', 2)::numeric;
    if d = 0 then return null; end if;
    return array[split_part(s, '/', 1)::numeric, d];
  end if;
  if s ~ '^-?\d{1,3}(\.\d{3})+$' then s := replace(s, '.', ''); end if;
  s := replace(s, ',', '.');
  if s ~ '^-?\d+(\.\d+)?$' then return array[s::numeric, 1]; end if;
  return null;
end $$;

create or replace function public.jse_grade(p_question text, p_answer jsonb) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare k record; acc text; a numeric[]; b numeric[]; i int;
begin
  select * into k from public.quiz_answer_keys where question_id = p_question;
  if not found or p_answer is null or p_answer = 'null'::jsonb then return false; end if;
  case k.kind
    when 'mcq', 'findError' then
      return jsonb_typeof(p_answer) = 'number' and p_answer = k.answer;
    when 'tf' then
      return jsonb_typeof(p_answer) = 'boolean' and p_answer = k.answer;
    when 'identify' then
      return p_answer = k.answer;
    when 'match' then
      if jsonb_typeof(p_answer) <> 'object' then return false; end if;
      for i in 0 .. (k.answer::text)::int - 1 loop
        if coalesce(p_answer ->> i::text, '') <> i::text then return false; end if;
      end loop;
      return true;
    when 'short' then
      if jsonb_typeof(p_answer) <> 'string' then return false; end if;
      for acc in select jsonb_array_elements_text(k.answer) loop
        if k.mode = 'value' then
          a := public.jse_rational(acc);
          b := public.jse_rational(p_answer #>> '{}');
          if a is not null and b is not null and a[1] * b[2] = b[1] * a[2] then return true; end if;
        elsif public.jse_norm(acc) = public.jse_norm(p_answer #>> '{}') then
          return true;
        end if;
      end loop;
      return false;
    else
      return false;
  end case;
end $$;
revoke execute on function public.jse_grade(text, jsonb) from public, anon, authenticated;

-- ───────────────────────── XP, LEVEL, LENCANA ─────────────────────────
create or replace function public.jse_level(p_xp int) returns smallint language sql immutable as $$
  select case when p_xp >= 2700 then 7 when p_xp >= 2000 then 6 when p_xp >= 1400 then 5
              when p_xp >= 900 then 4 when p_xp >= 500 then 3 when p_xp >= 200 then 2 else 1 end::smallint;
$$;

-- Hadiah idempoten: penuh sekali, ulangan 5 XP maks. sekali per hari (p_allow_repeat)
create or replace function public.jse_award(p_user uuid, p_key text, p_type text, p_title text,
  p_xp int, p_gems int, p_score int default null, p_allow_repeat boolean default true)
returns int language plpgsql security definer set search_path = public as $$
declare v_xp int := 0; v_gems int := 0; v_repeat boolean := false;
begin
  if exists (select 1 from activity_logs where user_id = p_user and activity_key = p_key and xp_awarded > 0 and not is_repeat) then
    if p_allow_repeat and not exists (
      select 1 from activity_logs where user_id = p_user and activity_key = p_key and is_repeat
        and (created_at at time zone 'Asia/Jakarta')::date = (now() at time zone 'Asia/Jakarta')::date) then
      v_xp := 5; v_repeat := true;
    end if;
  else
    v_xp := p_xp; v_gems := p_gems;
  end if;
  insert into activity_logs (user_id, activity_key, type, title, score, xp_awarded, gems_awarded, is_repeat)
  values (p_user, p_key, p_type, p_title, p_score, v_xp, v_gems, v_repeat)
  on conflict do nothing;
  if not found then return 0; end if;
  if v_xp > 0 or v_gems > 0 then
    update user_stats set xp = xp + v_xp, gems = gems + v_gems, level = jse_level(xp + v_xp), updated_at = now() where user_id = p_user;
  end if;
  perform jse_refresh_achievements(p_user);
  return v_xp;
end $$;

create or replace function public.jse_refresh_achievements(p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
declare done int[];
begin
  select coalesce(array_agg(region_id::int), '{}') into done from region_progress where user_id = p_user and completed_at is not null;
  insert into user_achievements (user_id, achievement_id)
  select p_user, a from (values
    ('langkah-pertama', 1 = any(done)),
    ('ahli-perkalian', 2 = any(done)),
    ('master-pembagian', 3 = any(done)),
    ('penjaga-gua', 4 = any(done)),
    ('pahlawan-nol', 5 = any(done)),
    ('penjelajah-negatif', 6 = any(done)),
    ('legenda', 7 = any(done) and (select count(distinct ref) from quiz_attempts where user_id = p_user and kind = 'challenge' and passed) = 3),
    ('peneliti-lab', (select count(distinct activity_key) from activity_logs where user_id = p_user and activity_key like 'lab:%' and activity_key <> 'lab:all') >= 8),
    ('jagoan-game', (select count(distinct game_id) from game_attempts where user_id = p_user and won) = 6)
  ) as t(a, ok) where ok
  on conflict do nothing;
end $$;

-- ───────────────────────── RPC UNTUK KLIEN ─────────────────────────
create or replace function public.submit_exam(p_kind text, p_answers jsonb, p_started_at timestamptz)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); q record; ok boolean; per jsonb := '[]'; c int := 0; n int := 0;
        ind jsonb := '{}'; cur jsonb; v_id uuid; v_score int; v_xp int := 0;
begin
  if u is null then raise exception 'Belum login'; end if;
  if p_kind not in ('pretest', 'posttest') then raise exception 'Jenis ujian tidak dikenal'; end if;
  if p_kind = 'posttest' and (
      (select count(*) from region_progress where user_id = u and completed_at is not null) < 7
      or (select count(distinct ref) from quiz_attempts where user_id = u and kind = 'challenge' and passed) < 3) then
    raise exception 'Posttest belum terbuka';
  end if;
  for q in select id, indicator from quiz_questions where quiz_id = p_kind order by position loop
    ok := jse_grade(q.id, p_answers -> q.id);
    per := per || to_jsonb(ok);
    n := n + 1; if ok then c := c + 1; end if;
    cur := coalesce(ind -> q.indicator, '[0,0]'::jsonb);
    ind := ind || jsonb_build_object(q.indicator, jsonb_build_array((cur->>0)::int + (case when ok then 1 else 0 end), (cur->>1)::int + 1));
  end loop;
  if n = 0 then raise exception 'Soal belum di-seed'; end if;
  v_score := round(c * 100.0 / n);
  if p_kind = 'pretest' then
    insert into pretest_attempts (user_id, answers, per_question, correct, wrong, score, by_indicator, started_at)
    values (u, p_answers, per, c, n - c, v_score, ind, coalesce(p_started_at, now())) returning id into v_id;
    insert into activity_logs (user_id, activity_key, type, title, score) values (u, 'pretest:' || v_id, 'pretest', 'Pretest dikumpulkan', v_score);
  else
    insert into posttest_attempts (user_id, answers, per_question, correct, wrong, score, by_indicator, started_at)
    values (u, p_answers, per, c, n - c, v_score, ind, coalesce(p_started_at, now())) returning id into v_id;
    v_xp := jse_award(u, 'posttest', 'posttest', 'Posttest dikumpulkan', 150, 5, v_score);
  end if;
  return jsonb_build_object('attempt_id', v_id, 'score', v_score, 'correct', c, 'wrong', n - c, 'per_question', per, 'xp_awarded', v_xp);
end $$;

create or replace function public.submit_quiz(p_kind text, p_ref text, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); qid text; ok boolean; per jsonb := '[]'; c int := 0; n int := 0;
        v_score int; v_passed boolean; v_xp int := 0; lvl int;
begin
  if u is null then raise exception 'Belum login'; end if;
  if not exists (select 1 from pretest_attempts where user_id = u) then raise exception 'Kerjakan pretest dulu'; end if;
  if p_kind = 'mission' then
    if p_ref !~ '^[1-7]$' then raise exception 'Wilayah tidak valid'; end if;
    for qid in select id from quiz_questions where quiz_id = 'mission-' || p_ref order by position loop
      ok := jse_grade(qid, p_answers -> qid); per := per || to_jsonb(ok); n := n + 1; if ok then c := c + 1; end if;
    end loop;
  elsif p_kind in ('practice', 'challenge') then
    if p_ref !~ '^[1-3]$' then raise exception 'Tingkat tidak valid'; end if;
    lvl := p_ref::int;
    if p_kind = 'challenge' and (select count(*) from region_progress where user_id = u and completed_at is not null) < 7 then
      raise exception 'Jungle Challenge belum terbuka';
    end if;
    if p_kind = 'challenge' and lvl > 1 and not exists (
      select 1 from quiz_attempts where user_id = u and kind = 'challenge' and ref = (lvl - 1)::text and passed) then
      raise exception 'Level sebelumnya belum ditaklukkan';
    end if;
    -- soal harus berasal dari bank pada tingkat yang benar; jumlah 5–15
    for qid in select key from jsonb_each(p_answers) loop
      if not exists (select 1 from quiz_questions where id = qid and quiz_id = 'bank' and level = lvl) then
        raise exception 'Soal tidak valid: %', qid;
      end if;
      ok := jse_grade(qid, p_answers -> qid); per := per || to_jsonb(ok); n := n + 1; if ok then c := c + 1; end if;
    end loop;
    if n < 5 or n > 15 then raise exception 'Jumlah soal tidak valid'; end if;
    -- latihan dianggap selesai hanya jika semua soal dijawab (sama seperti di aplikasi)
    if p_kind = 'practice' and exists (select 1 from jsonb_each(p_answers) e where e.value = 'null'::jsonb) then
      raise exception 'Semua soal latihan harus dijawab';
    end if;
  else
    raise exception 'Jenis kuis tidak dikenal';
  end if;
  v_score := round(c * 100.0 / greatest(n, 1));
  v_passed := case when p_kind = 'mission' then v_score >= 60 when p_kind = 'challenge' then v_score >= 70 else true end;
  insert into quiz_attempts (user_id, kind, ref, answers, per_question, correct, total, score, passed)
  values (u, p_kind, p_ref, p_answers, per, c, n, v_score, v_passed);
  if p_kind = 'mission' then
    insert into region_progress (user_id, region_id, mission_best, read_sections)
    values (u, p_ref::smallint, v_score, array['misi'])
    on conflict (user_id, region_id) do update
      set mission_best = greatest(region_progress.mission_best, excluded.mission_best),
          read_sections = (select array(select distinct unnest(region_progress.read_sections || array['misi']))),
          updated_at = now();
    insert into activity_logs (user_id, activity_key, type, title, score, detail)
    values (u, 'mission:' || p_ref || ':' || gen_random_uuid(), 'misi-wilayah', 'Misi Wilayah 0' || p_ref, v_score, c || '/' || n || ' benar');
  elsif p_kind = 'practice' then
    v_xp := jse_award(u, 'practice:' || p_ref, 'latihan', 'Latihan tingkat ' || p_ref, 60, 2, v_score);
  elsif v_passed then
    v_xp := jse_award(u, 'challenge:' || p_ref, 'jungle-challenge', 'Jungle Challenge Level ' || p_ref,
      case lvl when 1 then 100 when 2 then 150 else 200 end, case lvl when 1 then 3 when 2 then 4 else 5 end, v_score);
  else
    insert into activity_logs (user_id, activity_key, type, title, score, status)
    values (u, 'challenge-try:' || gen_random_uuid(), 'jungle-challenge', 'Jungle Challenge Level ' || p_ref, v_score, 'dicoba');
  end if;
  return jsonb_build_object('score', v_score, 'correct', c, 'total', n, 'passed', v_passed, 'xp_awarded', v_xp);
end $$;

create or replace function public.mark_section(p_region int, p_section text) returns void
language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'Belum login'; end if;
  if p_section not in ('pembuka','konsep','rumus','contoh','waspada','misi','rangkuman') or p_region not between 1 and 7 then
    raise exception 'Bagian tidak valid';
  end if;
  insert into region_progress (user_id, region_id, read_sections) values (u, p_region, array[p_section])
  on conflict (user_id, region_id) do update
    set read_sections = (select array(select distinct unnest(region_progress.read_sections || array[p_section]))), updated_at = now();
end $$;

create or replace function public.complete_region(p_region int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); rp record; v_xp int;
begin
  if u is null then raise exception 'Belum login'; end if;
  if not exists (select 1 from pretest_attempts where user_id = u) then
    return jsonb_build_object('ok', false, 'xp_awarded', 0, 'reason', 'Kerjakan pretest dulu.');
  end if;
  if p_region = 7 and (select count(*) from region_progress where user_id = u and region_id < 7 and completed_at is not null) < 6 then
    return jsonb_build_object('ok', false, 'xp_awarded', 0, 'reason', 'Selesaikan Wilayah 01–06 dulu.');
  end if;
  if p_region between 2 and 6 and not exists (select 1 from region_progress where user_id = u and region_id = p_region - 1 and completed_at is not null) then
    return jsonb_build_object('ok', false, 'xp_awarded', 0, 'reason', 'Wilayah sebelumnya belum selesai.');
  end if;
  select * into rp from region_progress where user_id = u and region_id = p_region;
  if not found or not (rp.read_sections @> array['pembuka','konsep','rumus','contoh','waspada','rangkuman']) then
    return jsonb_build_object('ok', false, 'xp_awarded', 0, 'reason', 'Buka semua bagian materi dulu, ya.');
  end if;
  if rp.mission_best < 60 then
    return jsonb_build_object('ok', false, 'xp_awarded', 0, 'reason', 'Selesaikan misi wilayah dengan skor minimal 60 dulu.');
  end if;
  update region_progress set completed_at = coalesce(completed_at, now()), updated_at = now() where user_id = u and region_id = p_region;
  v_xp := jse_award(u, 'region:' || p_region, 'wilayah-selesai', 'Wilayah 0' || p_region || ' selesai', 100, 3);
  return jsonb_build_object('ok', true, 'xp_awarded', v_xp);
end $$;

create or replace function public.complete_activity(p_kind text, p_ref text, p_score int, p_won boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); v_xp int := 0;
begin
  if u is null then raise exception 'Belum login'; end if;
  if p_kind = 'game' then
    if not exists (select 1 from games where id = p_ref) then raise exception 'Game tidak dikenal'; end if;
    insert into game_attempts (user_id, game_id, score, won) values (u, p_ref, least(greatest(p_score, 0), 100), p_won);
    if p_won then
      v_xp := jse_award(u, 'game:' || p_ref, 'mini-game', 'Mini-game ' || p_ref, 80, 3, p_score);
    else
      insert into activity_logs (user_id, activity_key, type, title, score, status)
      values (u, 'game-try:' || gen_random_uuid(), 'mini-game', 'Mini-game ' || p_ref, p_score, 'dicoba');
    end if;
  elsif p_kind = 'lab' then
    if p_ref not in ('builder','multiplier','divider','power','zero-negative','anatomy','slider','animation') then raise exception 'Eksperimen tidak dikenal'; end if;
    v_xp := jse_award(u, 'lab:' || p_ref, 'laboratorium', 'Eksperimen ' || p_ref, 10, 0, null, false);
    if (select count(distinct activity_key) from activity_logs where user_id = u and activity_key like 'lab:%' and activity_key <> 'lab:all') >= 8 then
      v_xp := v_xp + jse_award(u, 'lab:all', 'laboratorium', 'Semua eksperimen dicoba', 50, 2, null, false);
    end if;
  else
    raise exception 'Jenis aktivitas tidak dikenal';
  end if;
  return jsonb_build_object('xp_awarded', v_xp);
end $$;

-- Seluruh state pengguna dalam bentuk yang dipakai frontend
create or replace function public.get_my_state() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'Belum login'; end if;
  return jsonb_build_object(
    'profile', (select jsonb_build_object('id', p.id, 'full_name', p.full_name, 'username', p.username, 'nickname', p.nickname, 'kelas', p.kelas, 'avatar', p.avatar) from profiles p where p.id = u),
    'imported_guest', coalesce((select imported_guest from profiles where id = u), false),
    'stats', (select jsonb_build_object('xp', xp, 'gems', gems) from user_stats where user_id = u),
    'rewards', coalesce((select jsonb_agg(jsonb_build_object('key', activity_key, 'xp', xp_awarded, 'gems', gems_awarded, 'at', created_at, 'repeat', is_repeat) order by created_at)
                 from activity_logs where user_id = u and (xp_awarded > 0 or gems_awarded > 0)), '[]'),
    'regions', coalesce((select jsonb_agg(jsonb_build_object('region_id', region_id, 'read_sections', read_sections, 'mission_best', mission_best, 'completed_at', completed_at))
                 from region_progress where user_id = u), '[]'),
    'pretests', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'journeyId', '', 'explorerName', (select nickname from profiles where id = u), 'startedAt', started_at, 'finishedAt', finished_at,
                 'answers', answers, 'perQuestion', per_question, 'correct', correct, 'wrong', wrong, 'score', score, 'byIndicator', by_indicator) order by finished_at)
                 from pretest_attempts where user_id = u), '[]'),
    'posttests', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'journeyId', '', 'explorerName', (select nickname from profiles where id = u), 'startedAt', started_at, 'finishedAt', finished_at,
                 'answers', answers, 'perQuestion', per_question, 'correct', correct, 'wrong', wrong, 'score', score, 'byIndicator', by_indicator) order by finished_at)
                 from posttest_attempts where user_id = u), '[]'),
    'activities', coalesce((select jsonb_agg(jsonb_build_object('id', id::text, 'at', created_at, 'type', type, 'title', title, 'detail', detail, 'score', score, 'status', status) order by created_at)
                 from (select * from activity_logs where user_id = u order by created_at desc limit 400) a), '[]'),
    'games', coalesce((select jsonb_agg(jsonb_build_object('id', id::text, 'at', created_at, 'game', game_id, 'score', score, 'correct', 0, 'total', 0, 'won', won) order by created_at)
                 from game_attempts where user_id = u), '[]'),
    'games_won', coalesce((select jsonb_agg(distinct game_id) from game_attempts where user_id = u and won), '[]'),
    'practice', coalesce((select jsonb_agg(jsonb_build_object('id', id::text, 'at', created_at, 'level', ref::int, 'score', score, 'correct', correct, 'total', total) order by created_at)
                 from quiz_attempts where user_id = u and kind = 'practice'), '[]'),
    'challenge', coalesce((select jsonb_agg(jsonb_build_object('id', id::text, 'at', created_at, 'level', ref::int, 'score', score, 'correct', correct, 'total', total, 'passed', passed) order by created_at)
                 from quiz_attempts where user_id = u and kind = 'challenge'), '[]'),
    'lab_tried', coalesce((select jsonb_agg(distinct substr(activity_key, 5)) from activity_logs where user_id = u and activity_key like 'lab:%' and activity_key <> 'lab:all'), '[]')
  );
end $$;

-- Pindahkan progres tamu (localStorage) ke akun — hanya sekali, XP dihitung ulang di server
create or replace function public.import_guest_progress(p_payload jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); j jsonb := p_payload -> 'journey'; r record; a jsonb; g text; per jsonb; c int; n int; q record; ok boolean; l text;
begin
  if u is null then raise exception 'Belum login'; end if;
  if (select imported_guest from profiles where id = u) then return jsonb_build_object('imported', false, 'reason', 'Sudah pernah diimpor'); end if;

  -- pretest/posttest dinilai ulang dari jawaban
  for a in select * from jsonb_array_elements(coalesce(p_payload -> 'pretests', '[]')) loop
    per := '[]'; c := 0; n := 0;
    for q in select id from quiz_questions where quiz_id = 'pretest' order by position loop
      ok := jse_grade(q.id, a -> 'answers' -> q.id); per := per || to_jsonb(ok); n := n + 1; if ok then c := c + 1; end if;
    end loop;
    insert into pretest_attempts (user_id, answers, per_question, correct, wrong, score, by_indicator, started_at, finished_at)
    values (u, coalesce(a -> 'answers', '{}'), per, c, n - c, round(c * 100.0 / greatest(n, 1)), coalesce(a -> 'byIndicator', '{}'),
            coalesce((a ->> 'startedAt')::timestamptz, now()), coalesce((a ->> 'finishedAt')::timestamptz, now()));
  end loop;

  -- progres wilayah (hanya bagian yang dibaca & skor misi; penyelesaian dicek ulang)
  for r in select key::int as rid, value as v from jsonb_each(coalesce(j -> 'regions', '{}')) where key ~ '^[1-7]$' order by key loop
    insert into region_progress (user_id, region_id, read_sections, mission_best)
    values (u, r.rid, array(select jsonb_array_elements_text(coalesce(r.v -> 'read', '[]'))), least(greatest(coalesce((r.v ->> 'missionBest')::int, 0), 0), 100))
    on conflict (user_id, region_id) do update set read_sections = excluded.read_sections, mission_best = greatest(region_progress.mission_best, excluded.mission_best);
    if r.v ? 'completedAt' then perform complete_region(r.rid); end if;
  end loop;

  for g in select jsonb_array_elements_text(coalesce(j -> 'gamesWon', '[]')) loop
    if exists (select 1 from games where id = g) then perform complete_activity('game', g, 100, true); end if;
  end loop;
  for l in select jsonb_array_elements_text(coalesce(j -> 'labTried', '[]')) loop
    begin perform complete_activity('lab', l, 100, true); exception when others then null; end;
  end loop;

  update profiles set imported_guest = true,
    nickname = coalesce(nullif(left(j -> 'explorer' ->> 'name', 24), ''), nickname),
    avatar = case when (j -> 'explorer' ->> 'avatar') in ('daun','kompas','jamur','permata','kupu','bunga','kristal','gunung') then j -> 'explorer' ->> 'avatar' else avatar end
  where id = u;
  return jsonb_build_object('imported', true);
end $$;

grant execute on function public.submit_exam(text, jsonb, timestamptz) to authenticated;
grant execute on function public.submit_quiz(text, text, jsonb) to authenticated;
grant execute on function public.mark_section(int, text) to authenticated;
grant execute on function public.complete_region(int) to authenticated;
grant execute on function public.complete_activity(text, text, int, boolean) to authenticated;
grant execute on function public.get_my_state() to authenticated;
grant execute on function public.import_guest_progress(jsonb) to authenticated;
revoke execute on function public.jse_award(uuid, text, text, text, int, int, int, boolean) from public, anon, authenticated;
revoke execute on function public.jse_refresh_achievements(uuid) from public, anon, authenticated;
