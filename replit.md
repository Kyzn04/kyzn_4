# KYZN - Solo Leveling Inspired Productivity System

## Overview

KYZN is a gamified productivity application inspired by "Solo Leveling" anime/manga aesthetics. It transforms personal development into an RPG-like experience with character stats, skill trees, daily quests, and evolution mechanics. Users level up by improving core attributes (STR, AGI, INT, VIT, SEN, CHA) and completing real-world tasks tracked through the Kaizen Hexagon system.

The application features a cyberpunk-themed UI with neon colors, radar charts for stat visualization, and a progression system where users evolve through class titles (e.g., "Novice Tinkerer" → "Iron Monarch") based on accumulated stats.

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
- **Profiles**: Core stats (INT, STR, CHA, SEN, AGI, VIT), Kaizen stats, HP/MP, quest progress, titles/classes
- **Skills**: Tree structure with parent relationships, stat requirements, categories (Engineering Authority, Sovereign Leader, etc.)
- **UserSkills**: Junction table tracking unlocked skills per user

### Evolution System
Stats automatically trigger title/class evolution when thresholds are met (e.g., INT > 100 + SEN > 80 = "Electrical Engineer"). Logic lives in `server/routes.ts` and `server/storage.ts`.

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