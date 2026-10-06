# PredictProof

> **Decentralized Prediction Market Reputation Engine & Soulbound Credentials on Solana**  
> Built for the **Colosseum Crypto World's Fair Hackathon (Panta API Sidetrack)**.

PredictProof bridges prediction markets and on-chain identity. By tracking predictor performance across binary prediction markets powered by the Panta API, PredictProof computes verified accuracy metrics and allows eligible predictors to mint non-transferable, soulbound NFT badges on Solana Devnet.

---

## Architecture & Monorepo Structure

PredictProof is organized as a unified monorepo containing both the full-stack web application and the Solana Anchor on-chain program:

```text
PredictProof/
├── anchor/                                # Solana Anchor Smart Contract Workspace
│   ├── programs/event-attendance-nft/     # Rust smart contract source (lib.rs)
│   ├── tests/                             # TypeScript Anchor test suite (soulbound verification)
│   ├── target/idl/                        # Generated program IDL (event_attendance_nft.json)
│   ├── target/types/                      # Generated TypeScript types (event_attendance_nft.ts)
│   ├── Anchor.toml                        # Anchor configuration & devnet program deployment
│   └── Cargo.toml                         # Cargo workspace configuration
├── app/                                   # Next.js App Router Pages & Layouts
│   ├── page.tsx                           # Live Panta prediction market feed & teaser cards
│   ├── leaderboard/page.tsx               # On-chain predictor rankings & accuracy table
│   └── profile/                           # Wallet profile routing ([wallet]/page.tsx)
├── components/                            # Reusable React UI Components
│   ├── icons/                             # Custom inline SVG icon system (24 theme-specific icons)
│   ├── BadgeCard.tsx                      # Soulbound badge tier visual showcase
│   ├── ClaimBadgeButton.tsx               # Devnet Solana NFT badge minting trigger
│   ├── MarketCard.tsx                     # Polymarket-style binary market odds card
│   ├── MarketFeed.tsx                     # Category filtering & live odds feed
│   ├── Navbar.tsx                         # Header with category switcher & wallet connector
│   └── WalletButton.tsx                   # Solana wallet-adapter multi-button wrapper
├── lib/                                   # Shared Utilities, Clients, & Scoring Logic
│   ├── badge-config.ts                    # Verified on-chain Event PDAs & badge metadata URIs
│   ├── event-attendance-nft-exports.ts    # Typed Anchor program client wrapper
│   ├── panta-client.ts                    # Panta API client & local fixture fallbacks
│   ├── scoring.ts                         # Accuracy scoring, streak, & tier eligibility math
│   └── supabase-admin.ts                  # Server-only Supabase client for points engine
├── scripts/                               # Management & Verification Scripts
│   ├── setup-badge-tiers.ts               # Registers on-chain Event PDAs on Solana devnet
│   └── verify-badge-tiers.ts              # Read-only script auditing on-chain badge tiers
├── supabase/                              # Database Schemas & Migrations
│   └── schema.sql                         # PostgreSQL schema (wallets, test_markets, predictions)
└── public/                                # Static Assets & Badge Metadata JSONs
    └── badges/                            # Metadata JSONs (bronze.json, silver.json, etc.)
```

---

## Tech Stack

- **Frontend & Runtime**: [Next.js 14](https://nextjs.org) (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, custom design system, custom inline SVG icon library
- **Blockchain (Solana Devnet)**:
  - [Anchor Framework](https://www.anchor-lang.com/) (`@coral-xyz/anchor`)
  - Solana Web3.js (`@solana/web3.js`)
  - Solana Wallet Adapter (`@solana/wallet-adapter-react`, UI)
  - SPL Token (`@solana/spl-token`) with token account freezing (soulbound mechanism)
- **Data & APIs**:
  - [Panta API](https://panta.run) (Prediction market feed, binary probabilities, volume)
  - [Supabase](https://supabase.com) (`@supabase/supabase-js` PostgreSQL database for points prediction game)

---

## Current Features

1. **Live Panta Market Feed**: Real-time binary prediction markets fetched directly from the Panta API (with automatic fallback to curated sandbox fixtures when offline).
2. **Predictor Accuracy Scoring**: Comprehensive reputation scoring engine calculating:
   - Prediction accuracy percentage ($Wins / Total$)
   - Consecutive win streak bonuses ($streak \ge 3 \implies +0.5 \times streak$)
   - Underdog contrarian multipliers (winning calls on entry prices $\le \$0.15$ or $\le \$0.50$)
3. **Soulbound On-Chain NFT Badges**: 4 verifiable credential tiers registered on Solana Devnet:
   - **Bronze Predictor v2**: Baseline verified track record (3+ correct picks).
   - **Silver Forecaster v2**: Consistent accuracy (7+ correct picks at $\ge 60\%$ accuracy).
   - **Gold Oracle v2**: Elite market foresight (15+ correct picks at $\ge 75\%$ accuracy).
   - **Underdog Sniper v2**: High-conviction contrarian winner (entry odds $\le 15¢$).
   *Badges mint non-transferable SPL tokens into frozen token accounts, making them permanently soulbound to the recipient's wallet.*
4. **Predictor Leaderboard & Profiles**: Public rankings table and per-wallet reputation profiles with verified prediction histories and Solana Explorer deep links.
5. **Points-Based Prediction Game (Phase 4A In-Progress)**: Supabase-backed off-chain prediction engine with user wallets, simulated test markets, and points tracking.

> [!NOTE]
> **Data Notice**: Scoring metrics and soulbound badge eligibility currently derive from sample resolved prediction data (`lib/mock-data/resolved-markets.json`), pending live resolution event streams from the Panta API.

---

## Getting Started Locally

### Prerequisites

- Node.js 18+ (tested on Node v20 / v24)
- npm or yarn
- Solana CLI & Anchor CLI *(optional, only needed for compiling Anchor Rust contracts)*

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Akshat0125/PredictProof.git
cd PredictProof
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables

Create a `.env.local` file at the root of the project:

```env
PANTA_API_KEY=your_panta_api_key_here
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

*(Never commit `.env.local`. It is strictly excluded by `.gitignore`.)*

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
```

---

## Testing & Verification

- **Anchor Smart Contract Tests**:
  ```bash
  cd anchor && anchor test
  ```
  Runs the Anchor TypeScript test suite (`tests/event-attendance-nft.spec.ts`), including the soulbound token freeze verification.

- **On-Chain Badge Verification**:
  ```bash
  npx tsx scripts/verify-badge-tiers.ts
  ```
  Executes a read-only RPC audit of the 4 live devnet Event PDAs to verify on-chain metadata and URI alignment.

---

## Roadmap

- **Monthly Champion on-chain badge**: an additional soulbound NFT tier awarded to whoever tops the monthly points leaderboard each month. The underlying mechanism already exists in principle (reusing the same `create_event` / `check_in` pattern as the 4 existing badge tiers), but is intentionally not yet built — crowning a "monthly" winner isn't meaningful until a full month of real prediction data has elapsed.
- **Live Panta market resolution**: once Panta's production API moves markets beyond the current test-mode sandbox fixture, lifetime accuracy scoring can read directly from real resolved Panta markets instead of the current sample/mock dataset.
- **Expanded test market catalog**: the demo prediction game currently ships with 6 seeded sample questions; this is designed to scale to a larger, rotating set of questions without any schema changes.
- **Automated resolution**: market resolution currently runs via a manually-invoked admin script (`scripts/resolve-market.ts`); a future version could pull real outcomes from a trusted oracle or news API automatically.

---

## License

MIT
