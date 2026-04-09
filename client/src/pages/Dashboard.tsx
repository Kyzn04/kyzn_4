import { useProfile } from "@/hooks/use-profile";
import { Layout } from "@/components/layout/Layout";
import { CyberCard } from "@/components/ui/CyberCard";
import { StatRadar } from "@/components/dashboard/StatRadar";
import { CyberButton } from "@/components/ui/CyberButton";
import { Link, useLocation } from "wouter";
import { Activity, Zap, Shield, Brain, Trophy, Loader2, Plus, CheckCircle2, Info, Flame, AlertTriangle, FastForward, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Slider } from "@/components/ui/slider";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect } from "react";

export default function Dashboard() {
  const { profile, isLoading } = useProfile();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const incrementMutation = useMutation({
    mutationFn: async (stat: string) => {
      const res = await apiRequest("POST", `/api/profile/increment/${stat}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    }
  });

  const updateKaizenMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    }
  });

  const updateQuestMutation = useMutation({
    mutationFn: async ({ quest, mode }: { quest: string, mode?: "increment" | "complete" }) => {
      const res = await apiRequest("PATCH", `/api/profile/quest/${quest}${mode ? `?mode=${mode}` : ''}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    }
  });

  const claimRecoveryMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/profile/claim-recovery");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    }
  });

  const resetQuestsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/profile/reset-quests");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    }
  });

  const questProgress = profile?.questProgress as any;
  const questValues = Object.values(questProgress || {});
  const completedTasksList = questValues.filter((v: any) => typeof v === 'number' && v >= 1);
  const completedCount = completedTasksList.length;

  const isPerfect = completedCount >= 10;
  const isSafe = completedCount >= 6;

  const getRank = (level: number) => {
    if (level >= 121) return "S-Rank";
    if (level >= 81) return "A-Rank";
    if (level >= 56) return "B-Rank";
    if (level >= 26) return "C-Rank";
    if (level >= 11) return "D-Rank";
    return "E-Rank";
  };

  const getNextLevelXp = (lvl: number) => Math.floor(150 * Math.pow(1.10, lvl));
  const currentLevelXp = getNextLevelXp(profile?.level || 1);
  const xpProgress = ((profile?.experience || 0) / currentLevelXp) * 100;

  useEffect(() => {
    if (isPerfect && !profile?.rewardClaimedToday) {
      setLocation("/rewards");
    }
  }, [isPerfect, profile?.rewardClaimedToday, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-primary font-mono animate-pulse">INITIALIZING SYSTEM...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <CyberCard className="text-center py-20">
          <h2 className="text-2xl font-display text-primary mb-4">PROFILE NOT FOUND</h2>
          <p className="mb-8 text-muted-foreground">User data corrupted or missing initialization.</p>
          <Link href="/profile">
            <CyberButton>Initialize Profile</CyberButton>
          </Link>
        </CyberCard>
      </Layout>
    );
  }

  const kaizenData: any = {
    str: profile.kaizenStr,
    int: profile.kaizenInt,
    spi: profile.kaizenSpi,
    vit: profile.kaizenVit,
    wis: profile.kaizenWis,
    dis: profile.kaizenDis
  };

  const coreData: any = {
    str: profile.strength,
    agi: profile.agility,
    int: profile.intelligence,
    vit: profile.vitality,
    sen: profile.sense,
    cha: profile.charisma
  };

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
        {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border/50 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-2">
              DASHBOARD
            </h1>
            <div className="flex items-center gap-3">
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tighter border ${
                getRank(profile.level).includes('S') ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' :
                getRank(profile.level).includes('A') ? 'bg-orange-500/20 border-orange-500 text-orange-500' :
                getRank(profile.level).includes('B') ? 'bg-purple-500/20 border-purple-500 text-purple-500' :
                getRank(profile.level).includes('C') ? 'bg-blue-500/20 border-blue-500 text-blue-500' :
                'bg-zinc-500/20 border-zinc-500 text-zinc-400'
              }`}>
                {getRank(profile.level)}
              </div>
              <p className="text-primary font-mono text-sm tracking-widest uppercase">
                CLASS: <span className="text-white font-bold">{profile.currentTitle}</span> | LVL: <span className="text-white font-bold">{profile.level}</span>
              </p>
            </div>
            {/* XP Progress Bar */}
            <div className="mt-4 w-64">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">System Progress</span>
                <span className="text-[10px] font-mono text-primary">{Math.floor(xpProgress)}%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[8px] font-mono text-muted-foreground uppercase">{profile.experience} XP</span>
                <span className="text-[8px] font-mono text-muted-foreground uppercase">{currentLevelXp} XP REQ</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-4 mb-1">
              <div className="text-right">
                <div className="text-[10px] font-mono text-muted-foreground uppercase">XP</div>
                <div className="text-primary font-bold">{profile.experience}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-muted-foreground uppercase">Streak</div>
                <div className="text-orange-500 font-bold flex items-center gap-1 justify-end">
                  <Flame size={14} /> {profile.disciplineStreak}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-muted-foreground uppercase">Favor</div>
                <div className="text-yellow-500 font-bold">{profile.favorPoints || 0}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-muted-foreground uppercase">Merit</div>
                <div className="text-accent font-bold">{profile.disciplinePoints}</div>
              </div>
            </div>
            <div className="text-accent font-bold tracking-wider flex items-center justify-end gap-2 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              SYSTEM SYNCHRONIZED
            </div>
          </div>
        </div>

        {/* Z-Coins & Money Balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CyberCard className="p-4 bg-yellow-500/5 border-yellow-500/20 no-default-hover-elevate">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-500/20 rounded">
                  <Zap className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-yellow-500/60 uppercase">Z-Coins</p>
                  <p className="text-xl font-display font-bold text-yellow-500">{profile.zCoins || 0}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <input 
                  type="number" 
                  className="w-20 bg-black/40 border border-yellow-500/30 rounded px-2 py-1 text-xs font-mono text-yellow-500 focus:outline-none focus:border-yellow-500"
                  value={profile.zCoins || 0}
                  onChange={(e) => updateKaizenMutation.mutate({ zCoins: parseInt(e.target.value) || 0 })}
                />
                <span className="text-[8px] font-mono text-yellow-500/40 uppercase tracking-tighter">Adjust Balance</span>
              </div>
            </div>
          </CyberCard>

          <CyberCard className="p-4 bg-green-500/5 border-green-500/20 no-default-hover-elevate">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-500/20 rounded">
                  <span className="text-lg font-bold text-green-500">₱</span>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-green-500/60 uppercase">Money Balance</p>
                  <p className="text-xl font-display font-bold text-green-500">₱{profile.realMoneyBalance || 0}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <input 
                  type="number" 
                  className="w-24 bg-black/40 border border-green-500/30 rounded px-2 py-1 text-xs font-mono text-green-500 focus:outline-none focus:border-green-500"
                  value={profile.realMoneyBalance || 0}
                  onChange={(e) => updateKaizenMutation.mutate({ realMoneyBalance: parseInt(e.target.value) || 0 })}
                />
                <span className="text-[8px] font-mono text-green-500/40 uppercase tracking-tighter">Update Account</span>
              </div>
            </div>
          </CyberCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Core Attribute Training */}
          <CyberCard title="CORE ATTRIBUTES" variant="neon">
            <div className="space-y-6">
              <StatRadar stats={coreData} />
              <div className="grid grid-cols-2 gap-4">
                <StatTrainer label="STR" value={profile.strength} onIncrement={() => incrementMutation.mutate("strength")} disabled={incrementMutation.isPending || profile.strength >= 500} />
                <StatTrainer label="INT" value={profile.intelligence} onIncrement={() => incrementMutation.mutate("intelligence")} disabled={incrementMutation.isPending || profile.intelligence >= 500} />
                <StatTrainer label="AGI" value={profile.agility} onIncrement={() => incrementMutation.mutate("agility")} disabled={incrementMutation.isPending || profile.agility >= 500} />
                <StatTrainer label="VIT" value={profile.vitality} onIncrement={() => incrementMutation.mutate("vitality")} disabled={incrementMutation.isPending || profile.vitality >= 500} />
                <StatTrainer label="SEN" value={profile.sense} onIncrement={() => incrementMutation.mutate("sense")} disabled={incrementMutation.isPending || profile.sense >= 500} />
                <StatTrainer label="CHA" value={profile.charisma} onIncrement={() => incrementMutation.mutate("charisma")} disabled={incrementMutation.isPending || profile.charisma >= 500} />
              </div>
            </div>
          </CyberCard>

          {/* Daily Quest Section */}
          <CyberCard title="DAILY QUEST" variant="neon" className="relative">
            <div className="absolute top-4 right-4 flex items-center gap-3">
              <span className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest">{completedCount}/10 TASKS</span>
              <button
                onClick={() => {
                  if (window.confirm("End today's session and reset all quests? Progress will be logged to your transcript.")) {
                    resetQuestsMutation.mutate();
                  }
                }}
                disabled={resetQuestsMutation.isPending}
                title="New Day — log transcript & reset quests"
                className="flex items-center gap-1 px-2 py-1 border border-white/10 text-white/30 hover:border-red-500/50 hover:text-red-400 rounded text-[9px] font-mono uppercase tracking-tighter transition-all"
              >
                <RotateCcw size={9} />
                NEW DAY
              </button>
            </div>
            
            {!isSafe && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-3 animate-pulse">
                <AlertTriangle className="text-red-500 w-5 h-5" />
                <div className="flex-1">
                  <p className="text-red-500 text-[10px] font-mono font-bold uppercase">Punishment State Active</p>
                  <p className="text-red-400/60 text-[8px] font-mono">CRITICAL FAILURE: MINIMUM {6} OBJECTIVES NOT MET.</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Priority Tasks */}
              <div className="space-y-3">
                <p className="text-[10px] font-mono text-red-500/80 font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full" /> MANDATORY PRIORITY: FLOW STATE
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <QuestRow 
                    label="Deep Work Flow protocol" 
                    current={questProgress?.flow || 0} 
                    target={7} 
                    onPlus={() => updateQuestMutation.mutate({ quest: "flow", mode: "increment" })} 
                    onComplete={() => updateQuestMutation.mutate({ quest: "flow", mode: "complete" })}
                    priority
                  />
                </div>
              </div>

              {/* Physical Tasks */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <p className="text-[10px] font-mono text-cyan-500/80 uppercase tracking-widest">Workout Objectives</p>
                <div className="space-y-2">
                  <QuestRow label="Push-ups (35 reps)" current={questProgress?.push || 0} target={35} onPlus={() => updateQuestMutation.mutate({ quest: "push", mode: "increment" })} onComplete={() => updateQuestMutation.mutate({ quest: "push", mode: "complete" })} />
                  <QuestRow label="Sit-ups (35 reps)" current={questProgress?.sit || 0} target={35} onPlus={() => updateQuestMutation.mutate({ quest: "sit", mode: "increment" })} onComplete={() => updateQuestMutation.mutate({ quest: "sit", mode: "complete" })} />
                  <QuestRow label="Squats (30 reps)" current={questProgress?.squat || 0} target={30} onPlus={() => updateQuestMutation.mutate({ quest: "squat", mode: "increment" })} onComplete={() => updateQuestMutation.mutate({ quest: "squat", mode: "complete" })} />
                </div>
              </div>

              {/* Spiritual/Maintenance Tasks */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <p className="text-[10px] font-mono text-primary/80 uppercase tracking-widest">System Maintenance</p>
                <div className="space-y-2">
                  <QuestRow label="Bible (3 chapters)" current={questProgress?.bible || 0} target={3} onPlus={() => updateQuestMutation.mutate({ quest: "bible", mode: "increment" })} onComplete={() => updateQuestMutation.mutate({ quest: "bible", mode: "complete" })} />
                  <QuestRow label="Reading (5 pages)" current={questProgress?.book || 0} target={5} onPlus={() => updateQuestMutation.mutate({ quest: "book", mode: "increment" })} onComplete={() => updateQuestMutation.mutate({ quest: "book", mode: "complete" })} />
                  <QuestRow label="Nutrition (4 meals)" current={questProgress?.meals || 0} target={4} onPlus={() => updateQuestMutation.mutate({ quest: "meals", mode: "increment" })} onComplete={() => updateQuestMutation.mutate({ quest: "meals", mode: "complete" })} />
                  <QuestRow label="Meditation" current={questProgress?.meditation || 0} target={1} onPlus={() => updateQuestMutation.mutate({ quest: "meditation", mode: "increment" })} onComplete={() => updateQuestMutation.mutate({ quest: "meditation", mode: "complete" })} />
                  <QuestRow label="Journaling" current={questProgress?.journaling || 0} target={1} onPlus={() => updateQuestMutation.mutate({ quest: "journaling", mode: "increment" })} onComplete={() => updateQuestMutation.mutate({ quest: "journaling", mode: "complete" })} />
                  <QuestRow label="Creation Output" current={questProgress?.creation || 0} target={1} onPlus={() => updateQuestMutation.mutate({ quest: "creation", mode: "increment" })} onComplete={() => updateQuestMutation.mutate({ quest: "creation", mode: "complete" })} />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <div className="flex justify-center gap-4 mb-4">
                   <div className={`px-3 py-1 border text-[10px] font-mono ${isSafe ? 'border-green-500/50 text-green-500' : 'border-white/20 text-white/20'}`}>
                     SAFE
                   </div>
                   <div className={`px-3 py-1 border text-[10px] font-mono ${isPerfect ? 'border-yellow-500/50 text-yellow-500 animate-pulse' : 'border-white/20 text-white/20'}`}>
                     REWARD ELIGIBLE ({completedCount}/10)
                   </div>
                </div>
                <CyberButton 
                  onClick={() => claimRecoveryMutation.mutate()}
                  disabled={!isPerfect || claimRecoveryMutation.isPending || profile.rewardClaimedToday}
                  className="w-full"
                >
                  {profile.rewardClaimedToday ? "PROTOCOL COMPLETE" : "CLAIM RECOVERY"}
                </CyberButton>
              </div>
            </div>
          </CyberCard>
        </div>
      </div>
    </Layout>
  );
}

function StatTrainer({ label, value, onIncrement, disabled }: any) {
  return (
    <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded flex justify-between items-center group hover:border-cyan-500/40 transition-all">
      <div className="flex flex-col">
        <span className="font-mono text-[10px] text-cyan-500/60 uppercase">{label}</span>
        <span className="font-display font-bold text-white text-lg">{value}</span>
      </div>
      <button 
        onClick={onIncrement}
        disabled={disabled}
        className="w-8 h-8 rounded border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-20"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function QuestRow({ label, current, target, onPlus, onComplete, priority = false }: any) {
  const isDone = current >= target;
  return (
    <div className={`flex items-center gap-4 group p-2 rounded transition-all ${priority ? 'bg-red-500/5 border border-red-500/10' : 'hover:bg-white/5'}`}>
      <span className={`flex-1 font-mono text-xs tracking-tight ${isDone ? 'text-white/40 line-through' : priority ? 'text-red-400 font-bold' : 'text-white/80'}`}>
        {priority && <span className="text-[8px] bg-red-500 text-white px-1 mr-2 rounded uppercase tracking-tighter">Priority</span>}
        {label}
      </span>
      <span className={`font-mono text-xs ${isDone ? 'text-green-500' : priority ? 'text-red-400' : 'text-cyan-400/80'}`}>
        [{current}/{target}]
      </span>
      <div className="flex gap-1">
        <button 
          onClick={onPlus}
          disabled={isDone}
          title="Increment +1"
          className={`w-5 h-5 border flex items-center justify-center transition-all ${
            isDone ? 'border-green-500 text-green-500 opacity-50' : priority ? 'border-red-500/40 text-red-500/40 hover:border-red-500 hover:text-red-500' : 'border-white/20 text-white/20 hover:border-cyan-500 hover:text-cyan-500'
          }`}
        >
          <Plus size={10} />
        </button>
        <button 
          onClick={onComplete}
          disabled={isDone}
          title="Complete Task"
          className={`w-5 h-5 border flex items-center justify-center transition-all ${
            isDone ? 'border-green-500 text-green-500 opacity-50' : priority ? 'border-red-500/40 text-red-500/40 hover:border-red-500 hover:text-red-500' : 'border-white/20 text-white/20 hover:border-cyan-500 hover:text-cyan-500'
          }`}
        >
          {isDone ? <CheckCircle2 size={10} /> : <FastForward size={10} />}
        </button>
      </div>
    </div>
  );
}
