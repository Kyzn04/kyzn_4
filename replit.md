# KAIOS - Life Operating System

## Overview

KAIOS (Life Operating System) is a gamified personal development application inspired by Solo Leveling aesthetics and advanced system interfaces. It transforms personal growth into an RPG-like experience with character stats, skill trees, daily quests, and evolution mechanics. Users level up by improving core attributes (STR, AGI, INT, VIT, SEN, CHA) and completing real-world tasks.

The application features a cyberpunk-themed UI with Azonix branding font, neon cyan palette, radar charts for stat visualization, and a rank-based progression system (E→S). Each user account is fully independent with separate progression, stats, achievements, and history.

## Branding

- App name: **KAIOS** (formerly KYZN)
- Brand font: **Azonix** (via fonts.cdnfonts.com), falls back to Orbitron
- Display font: **Orbitron** for UI headers
- Body font: **Rajdhani**
- Mono font: **Share Tech Mono**

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom cyberpunk theme (CSS variables for neon cyan, pink, yellow palette)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Charts**: Recharts for radar stat visualization
- **Animations**: Framer Motion for transitions and effects
- **Fonts**: Orbitron (display), Rajdhani (body), Share Tech Mono (code)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: REST endpoints defined in `shared/routes.ts` with Zod validation
- **Build**: Vite for client, esbuild for server bundling

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` (profiles, skills, userSkills tables)
- **Migrations**: Drizzle Kit (`db:push` command)

### Authentication
- **Method**: Replit Auth (OpenID Connect)
- **Session Storage**: PostgreSQL via connect-pg-simple
- **Session Management**: express-session with passport.js

### Key Data Models
- **Profiles**: Core stats (INT, STR, CHA, SEN, AGI, VIT), Kaizen stats, HP/MP, quest progress, titles/classes, identity fields (username, displayName, gender, avatarUrl, onboardingComplete)
- **Skills**: Tree structure with parent relationships, stat requirements, categories (Engineering Authority, Sovereign Leader, etc.)
- **UserSkills**: Junction table tracking unlocked skills per user

### Identity & Onboarding System
- New users go through a 3-step onboarding wizard (callsign/username, avatar selection, gender classification)
- `onboardingComplete` flag gates access to the main app
- Each account is fully isolated — separate stats, quest history, skills, and progression
- Avatar system: 6 default DiceBear bot avatars + custom URL input
- Titles evolve automatically based on dominant stat rank (cannot be manually edited)

### Evolution System
Stats automatically trigger title/class evolution based on the dominant stat and its E→S rank. The rank-based title system maps each stat category to 6 titles (E through S rank). Thresholds: E(1-10), D(11-25), C(26-55), B(56-80), A(81-120), S(121+). Logic lives in `server/routes.ts` and `server/storage.ts`.

### Stat Categories & Titles
- **INT → Engineering Authority**: Novice Tinkerer → Apprentice Technician → Field Engineer → Systems Specialist → Lead Engineer → Engineering Polymath
- **STR → Apex Predator**: Untested Brawler → Iron Trainee → Physical Operator → Combat Veteran → Apex Fighter → Iron Monarch
- **CHA → Sovereign Leader**: Silent Observer → Emerging Voice → Social Tactician → Influential Leader → Sovereign Commander → Legendary Sovereign
- **SEN → Creative Architect**: Raw Observer → Pattern Finder → Design Apprentice → Creative Operator → Master Architect → Visionary Creator
- **AGI → Tactical Phantom**: Slow Starter → Quick Learner → Swift Operator → Tactical Ghost → Phantom Runner → Void Dasher
- **VIT → Undying Fortress**: Fragile Frame → Hardened Shell → Resilient Core → Living Fortress → Immortal Wall → Undying Titan

### Pages
- `/` Dashboard: Core stats, daily quests, Z-Coins, money balance
- `/status` Player Status: E→S rank display per stat, overall rank badge, dominant class path, XP bar
- `/skills` Skill Tree: Unlockable skills organized by category
- `/discipline` Discipline tracking
- `/streak` Streak history
- `/rewards` Reward claiming (requires 10/10 quests)
- `/shop` Shop (Z-Coins purchases: Focus Surge, Streak Seal, Flow Anchor, Temporal Grace)
- `/profile` Identity/profile editing

## External Dependencies

### Database
- PostgreSQL (required, connection via `DATABASE_URL` environment variable)

### Authentication
- Replit Auth OIDC provider (`ISSUER_URL` defaults to https://replit.com/oidc)
- Requires `SESSION_SECRET` and `REPL_ID` environment variables

### Third-Party Libraries
- **@tanstack/react-query**: Server state management
- **recharts**: Radar chart visualization
- **framer-motion**: Animation library
- **drizzle-orm** + **drizzle-zod**: Database ORM with validation
- **passport** + **openid-client**: Authentication flow
- **shadcn/ui**: Pre-built accessible UI components

### Development Tools
- Vite dev server with HMR
- Replit-specific plugins (cartographer, dev-banner, runtime-error-modal)