import { useProfile } from "@/hooks/use-profile";
import { Layout } from "@/components/layout/Layout";
import { CyberCard } from "@/components/ui/CyberCard";
import { Loader2, Star, Zap, Flame } from "lucide-react";

type Rank = "E" | "D" | "C" | "B" | "A" | "S";

function getRank(value: number): Rank {
  if (value >= 121) return "S";
  if (value >= 81) return "A";
  if (value >= 56) return "B";
  if (value >= 26) return "C";
  if (value >= 11) return "D";
  return "E";
}

function getLevelRank(level: number): Rank {
  if (level >= 121) return "S";
  if (level >= 81) return "A";
  if (level >= 56) return "B";
  if (level >= 26) return "C";
  if (level >= 11) return "D";
  return "E";
}

const RANK_COLORS: Record<Rank, { bg: string; border: string; text: string; glow: string }> = {
  E: { bg: "bg-zinc-500/15", border: "border-zinc-500", text: "text-zinc-400", glow: "" },
  D: { bg: "bg-green-500/15", border: "border-green-500", text: "text-green-400", glow: "" },
  C: { bg: "bg-blue-500/15", border: "border-blue-500", text: "text-blue-400", glow: "" },
  B: { bg: "bg-purple-500/15", border: "border-purple-500", text: "text-purple-400", glow: "" },
  A: { bg: "bg-orange-500/15", border: "border-orange-500", text: "text-orange-400", glow: "" },
  S: { bg: "bg-red-500/15", border: "border-red-500", text: "text-red-500", glow: "shadow-[0_0_12px_rgba(239,68,68,0.5)]" },
};

const STAT_TRAITS: Record<string, { label: string; key: string; category: string; color: string; titles: Record<Rank, string> }> = {
  int: {
    label: "INT",
    key: "intelligence",
    category: "Engineering Authority",
    color: "text-cyan-400",
    titles: {
      E: "Novice Tinkerer",
      D: "Apprentice Technician",
      C: "Field Engineer",
      B: "Systems Specialist",
      A: "Lead Engineer",
      S: "Engineering Polymath",
    },
  },
  str: {
    label: "STR",
    key: "strength",
    category: "Apex Predator",
    color: "text-red-400",
    titles: {
      E: "Untested Brawler",
      D: "Iron Trainee",
      C: "Physical Operator",
      B: "Combat Veteran",
      A: "Apex Fighter",
      S: "Iron Monarch",
    },
  },
  cha: {
    label: "CHA",
    key: "charisma",
    category: "Sovereign Leader",
    color: "text-yellow-400",
    titles: {
      E: "Silent Observer",
      D: "Emerging Voice",
      C: "Social Tactician",
      B: "Influential Leader",
      A: "Sovereign Commander",
      S: "Legendary Sovereign",
    },
  },
  sen: {
    label: "SEN",
    key: "sense",
    category: "Creative Architect",
    color: "text-pink-400",
    titles: {
      E: "Raw Observer",
      D: "Pattern Finder",
      C: "Design Apprentice",
      B: "Creative Operator",
      A: "Master Architect",
      S: "Visionary Creator",
    },
  },
  agi: {
    label: "AGI",
    key: "agility",
    category: "Tactical Phantom",
    color: "text-green-400",
    titles: {
      E: "Slow Starter",
      D: "Quick Learner",
      C: "Swift Operator",
      B: "Tactical Ghost",
      A: "Phantom Runner",
      S: "Void Dasher",
    },
  },
  vit: {
    label: "VIT",
    key: "vitality",
    category: "Undying Fortress",
    color: "text-orange-400",
    titles: {
      E: "Fragile Frame",
      D: "Hardened Shell",
      C: "Resilient Core",
      B: "Living Fortress",
      A: "Immortal Wall",
      S: "Undying Titan",
    },
  },
};

const RANK_THRESHOLDS: { rank: Rank; min: number; max: number | null; label: string }[] = [
  { rank: "E", min: 1, max: 10, label: "1 – 10" },
  { rank: "D", min: 11, max: 25, label: "11 – 25" },
  { rank: "C", min: 26, max: 55, label: "26 – 55" },
  { rank: "B", min: 56, max: 80, label: "56 – 80" },
  { rank: "A", min: 81, max: 120, label: "81 – 120" },
  { rank: "S", min: 121, max: null, label: "121+" },
];

function RankBadge({ rank, large = false }: { rank: Rank; large?: boolean }) {
  const c = RANK_COLORS[rank];
  return (
    <span
      className={`inline-flex items-center justify-center font-display font-black tracking-tighter border ${c.bg} ${c.border} ${c.text} ${c.glow} ${large ? "text-2xl w-14 h-14 rounded-sm" : "text-xs px-2 py-0.5 rounded"}`}
    >
      {rank}
    </span>
  );
}

function StatTraitCard({ statKey, value }: { statKey: string; value: number }) {
  const trait = STAT_TRAITS[statKey];
  if (!trait) return null;
  const rank = getRank(value);
  const colors = RANK_COLORS[rank];
  const nextRankInfo = RANK_THRESHOLDS.find((t) => t.min > value);
  const toNext = nextRankInfo ? nextRankInfo.min - value : 0;
  const maxForRank = RANK_THRESHOLDS.find((t) => t.rank === rank);
  const rangeMax = maxForRank?.max ?? value;
  const rangeMin = maxForRank?.min ?? 1;
  const progress = rangeMax ? Math.min(100, ((value - rangeMin) / (rangeMax - rangeMin + 1)) * 100) : 100;

  return (
    <CyberCard className={`p-5 border ${colors.border}/40 ${colors.bg} relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5 rounded-full blur-2xl" style={{ background: "var(--primary)" }} />

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${colors.text}`}>
            {trait.category}
          </div>
          <div className={`text-xl font-display font-black ${trait.color}`}>{trait.label}</div>
        </div>
        <RankBadge rank={rank} large />
      </div>

      <div className={`text-sm font-bold font-display mb-3 ${colors.text}`}>
        {trait.titles[rank]}
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[9px] font-mono text-muted-foreground uppercase">Mastery</span>
          <span className={`text-[10px] font-mono font-bold ${colors.text}`}>{value}</span>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div
            className={`h-full transition-all duration-1000 ease-out ${colors.bg} border-r ${colors.border}`}
            style={{ width: `${rank === "S" ? 100 : progress}%` }}
          />
        </div>
        {rank !== "S" && (
          <div className="mt-1 text-[8px] font-mono text-muted-foreground/50 uppercase">
            {toNext} pts to next rank
          </div>
        )}
        {rank === "S" && (
          <div className="mt-1 text-[8px] font-mono text-red-500/70 uppercase animate-pulse">
            MAX RANK ACHIEVED
          </div>
        )}
      </div>
    </CyberCard>
  );
}

export default function PlayerStatus() {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const levelRank = getLevelRank(profile.level);
  const levelRankColors = RANK_COLORS[levelRank];
  const getNextLevelXp = (lvl: number) => Math.floor(150 * Math.pow(1.10, lvl));
  const currentLevelXp = getNextLevelXp(profile.level);
  const xpProgress = Math.min(100, ((profile.experience || 0) / currentLevelXp) * 100);

  const statEntries: { key: string; value: number }[] = [
    { key: "int", value: profile.intelligence },
    { key: "str", value: profile.strength },
    { key: "cha", value: profile.charisma },
    { key: "sen", value: profile.sense },
    { key: "agi", value: profile.agility },
    { key: "vit", value: profile.vitality },
  ];

  const highestStat = statEntries.reduce((best, s) => (s.value > best.value ? s : best), statEntries[0]);
  const highestRank = getRank(highestStat.value);
  const dominantTrait = STAT_TRAITS[highestStat.key];

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
        {/* Header */}
        <div className="border-b border-border/50 pb-6">
          <h1 className="text-4xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-2 uppercase">
            Player Status
          </h1>
          <p className="text-primary font-mono text-sm tracking-widest uppercase">
            Trait Mastery &amp; Rank Progression
          </p>
        </div>

        {/* Overall Rank Card */}
        <CyberCard className={`p-6 border ${levelRankColors.border}/50 ${levelRankColors.bg} ${levelRankColors.glow}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div
                className={`w-20 h-20 rounded border-2 ${levelRankColors.border} ${levelRankColors.bg} flex items-center justify-center ${levelRankColors.glow}`}
              >
                <span className={`text-4xl font-display font-black ${levelRankColors.text}`}>
                  {levelRank}
                </span>
              </div>
              <div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                  Overall Rank
                </div>
                <div className="text-2xl font-display font-black text-white">
                  {levelRank}-Rank Hunter
                </div>
                <div className="text-sm font-mono text-muted-foreground mt-1">
                  {profile.currentTitle} &bull; Level {profile.level}
                </div>
              </div>
            </div>

            <div className="md:ml-auto w-full md:w-72">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">System XP</span>
                <span className={`text-[10px] font-mono font-bold ${levelRankColors.text}`}>
                  {Math.floor(xpProgress)}%
                </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                  className={`h-full ${levelRankColors.bg} border-r ${levelRankColors.border} transition-all duration-1000`}
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] font-mono text-muted-foreground">{profile.experience} XP</span>
                <span className="text-[9px] font-mono text-muted-foreground">{currentLevelXp} XP REQ</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-[9px] font-mono text-muted-foreground uppercase">Streak</div>
                  <div className="text-orange-400 font-bold flex items-center justify-center gap-1">
                    <Flame size={12} />{profile.disciplineStreak}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] font-mono text-muted-foreground uppercase">Merit</div>
                  <div className="text-accent font-bold">{profile.disciplinePoints}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] font-mono text-muted-foreground uppercase">Z-Coins</div>
                  <div className="text-yellow-500 font-bold flex items-center justify-center gap-1">
                    <Zap size={12} />{profile.zCoins || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CyberCard>

        {/* Dominant Class Banner */}
        <div className="flex items-center gap-3 p-4 border border-primary/20 bg-primary/5 rounded">
          <Star className="w-5 h-5 text-primary" />
          <div>
            <span className="text-[10px] font-mono text-primary/60 uppercase tracking-widest block">
              Dominant Class Path
            </span>
            <span className="font-display font-bold text-white">
              {dominantTrait?.category} &mdash;{" "}
              <span className="text-primary">{dominantTrait?.titles[highestRank]}</span>
            </span>
          </div>
          <RankBadge rank={highestRank} />
        </div>

        {/* Rank Reference */}
        <div>
          <h2 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Rank Thresholds
          </h2>
          <div className="flex flex-wrap gap-2">
            {RANK_THRESHOLDS.map((t) => {
              const c = RANK_COLORS[t.rank];
              return (
                <div
                  key={t.rank}
                  className={`flex items-center gap-2 px-3 py-1.5 border rounded ${c.border}/50 ${c.bg}`}
                >
                  <span className={`font-display font-black text-sm ${c.text}`}>{t.rank}</span>
                  <span className="text-[9px] font-mono text-muted-foreground">{t.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stat Trait Cards Grid */}
        <div>
          <h2 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">
            Trait Mastery Ranks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statEntries.map((s) => (
              <StatTraitCard key={s.key} statKey={s.key} value={s.value} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
