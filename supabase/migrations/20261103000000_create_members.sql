-- 회원 명부: 로그인한 회원은 자기 이름만 읽을 수 있습니다.
create table public.members (
  email text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.members enable row level security;

create policy "members can read own row"
  on public.members for select
  to authenticated
  using (email = (select auth.jwt() ->> 'email'));
