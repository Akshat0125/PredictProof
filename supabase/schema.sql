create table wallets (
  wallet_address text primary key,
  points_balance integer not null default 100,
  created_at timestamptz not null default now()
);

create table test_markets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  resolved boolean not null default false,
  winning_side text check (winning_side in ('YES','NO')),
  created_at timestamptz not null default now()
);

create table predictions (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null references wallets(wallet_address),
  market_id uuid not null references test_markets(id),
  side text not null check (side in ('YES','NO')),
  points_delta integer,
  created_at timestamptz not null default now()
);
