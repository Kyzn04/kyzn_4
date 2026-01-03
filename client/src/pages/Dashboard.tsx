import { useProfile } from "@/hooks/use-profile";
import { Layout } from "@/components/layout/Layout";
import { CyberCard } from "@/components/ui/CyberCard";
import { StatRadar } from "@/components/dashboard/StatRadar";
import { CyberButton } from "@/components/ui/CyberButton";
import { Link } from "wouter";
import { Activity, Zap, Shield, Brain, Trophy, Loader2, Plus, CheckCircle2, Info } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Slider } from "@/components/ui/slider";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const { profile, isLoading } = useProfile();
  const { user } = useAuth();

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
    mutationFn: async (quest: string) => {
      const res = await apiRequest("PATCH", `/api/profile/quest/${quest}`);
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

  const questProgress = profile.questProgress as any;
  const isQuestComplete = 
    questProgress.push >= 100 && 
    questProgress.sit >= 100 && 
    questProgress.squat >= 100 && 
    questProgress.run >= 10;

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border/50 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-2">
              DASHBOARD
            </h1>
            <p className="text-primary font-mono text-sm tracking-widest">
              WELCOME BACK, <span className="text-white font-bold">{user?.firstName?.toUpperCase()}</span>
            </p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-xs font-mono text-muted-foreground">SYSTEM STATUS</div>
            <div className="text-accent font-bold tracking-wider flex items-center justify-end gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              OPERATIONAL
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Core Attribute Training */}
          <CyberCard title="CORE ATTRIBUTES (0-500)" variant="neon">
            <div className="space-y-6">
              <StatRadar stats={coreData} />
              <div className="grid grid-cols-2 gap-4">
                <StatTrainer 
                  label="STR" 
                  value={profile.strength} 
                  onIncrement={() => incrementMutation.mutate("strength")} 
                  disabled={incrementMutation.isPending || profile.strength >= 500} 
                />
                <StatTrainer 
                  label="INT" 
                  value={profile.intelligence} 
                  onIncrement={() => incrementMutation.mutate("intelligence")} 
                  disabled={incrementMutation.isPending || profile.intelligence >= 500} 
                />
                <StatTrainer 
                  label="AGI" 
                  value={profile.agility} 
                  onIncrement={() => incrementMutation.mutate("agility")} 
                  disabled={incrementMutation.isPending || profile.agility >= 500} 
                />
                <StatTrainer 
                  label="VIT" 
                  value={profile.vitality} 
                  onIncrement={() => incrementMutation.mutate("vitality")} 
                  disabled={incrementMutation.isPending || profile.vitality >= 500} 
                />
                <StatTrainer 
                  label="SEN" 
                  value={profile.sense} 
                  onIncrement={() => incrementMutation.mutate("sense")} 
                  disabled={incrementMutation.isPending || profile.sense >= 500} 
                />
                <StatTrainer 
                  label="CHA" 
                  value={profile.charisma} 
                  onIncrement={() => incrementMutation.mutate("charisma")} 
                  disabled={incrementMutation.isPending || profile.charisma >= 500} 
                />
              </div>
            </div>
          </CyberCard>

          {/* Kaizen Hexagon */}
          <CyberCard title="KAIZEN HEXAGON (1-100)" variant="neon">
            <div className="space-y-6">
              <StatRadar stats={kaizenData} />
              <div className="space-y-4">
                <KaizenSlider label="STR" value={profile.kaizenStr} onChange={(v: number[]) => updateKaizenMutation.mutate({ kaizenStr: v[0] })} />
                <KaizenSlider label="INT" value={profile.kaizenInt} onChange={(v: number[]) => updateKaizenMutation.mutate({ kaizenInt: v[0] })} />
                <KaizenSlider label="SPI" value={profile.kaizenSpi} onChange={(v: number[]) => updateKaizenMutation.mutate({ kaizenSpi: v[0] })} />
                <KaizenSlider label="VIT" value={profile.kaizenVit} onChange={(v: number[]) => updateKaizenMutation.mutate({ kaizenVit: v[0] })} />
                <KaizenSlider label="WIS" value={profile.kaizenWis} onChange={(v: number[]) => updateKaizenMutation.mutate({ kaizenWis: v[0] })} />
                <KaizenSlider label="DIS" value={profile.kaizenDis} onChange={(v: number[]) => updateKaizenMutation.mutate({ kaizenDis: v[0] })} />
              </div>
            </div>
          </CyberCard>
        </div>

        {/* Daily Quest Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CyberCard title="QUEST INFO" variant="neon" className="relative">
              <div className="absolute top-4 right-4 text-cyan-500/50">
                <Info size={20} />
              </div>
              <div className="text-center mb-8">
                <p className="text-cyan-400 font-mono text-sm">[Daily Quest: Strength Training has arrived.]</p>
                <h2 className="text-3xl font-display font-black text-white mt-4 border-b-2 border-white inline-block px-4 pb-1">GOAL</h2>
              </div>

              <div className="space-y-6 max-w-md mx-auto">
                <QuestRow label="Push-ups" current={questProgress.push} target={100} onPlus={() => updateQuestMutation.mutate("push")} />
                <QuestRow label="Sit-ups" current={questProgress.sit} target={100} onPlus={() => updateQuestMutation.mutate("sit")} />
                <QuestRow label="Squats" current={questProgress.squat} target={100} onPlus={() => updateQuestMutation.mutate("squat")} />
                <QuestRow label="Running" current={questProgress.run} target={10} unit="km" onPlus={() => updateQuestMutation.mutate("run")} />
              </div>

              <div className="mt-12 text-center space-y-8">
                <p className="text-xs font-mono text-white/60">
                  WARNING: Failure to complete the daily quest will result in an appropriate <span className="text-red-500 font-bold">penalty</span>.
                </p>
                <div className="flex justify-center">
                  <button 
                    onClick={() => claimRecoveryMutation.mutate()}
                    disabled={!isQuestComplete || claimRecoveryMutation.isPending}
                    className={`w-16 h-16 border-2 flex items-center justify-center transition-all ${
                      isQuestComplete 
                        ? "border-green-500 text-green-500 hover:bg-green-500/20 animate-pulse" 
                        : "border-white/20 text-white/20 cursor-not-allowed"
                    }`}
                  >
                    <CheckCircle2 size={32} />
                  </button>
                </div>
              </div>
            </CyberCard>
          </div>

          <div className="lg:col-span-1">
             <CyberCard title="DISCIPLINE LOG" variant="neon">
               <div className="space-y-4">
                 <p className="text-xs font-mono text-cyan-500/60 mb-4 uppercase tracking-widest">Fixed Tasks</p>
                 <DisciplineTask label="System Initialization" completed />
                 <DisciplineTask label="Attribute Calibration" completed />
                 <p className="text-xs font-mono text-cyan-500/60 my-4 uppercase tracking-widest">Rotating Tasks</p>
                 <DisciplineTask label="Deep Focus Protocol" />
                 <DisciplineTask label="Neural Network Sync" />
                 <DisciplineTask label="Biometric Log Update" />
               </div>
               <div className="mt-8 pt-6 border-t border-cyan-500/20">
                 <div className="flex justify-between items-end">
                   <div>
                     <p className="text-[10px] font-mono text-cyan-500/60 uppercase">Reward Status</p>
                     <p className="text-xl font-display text-white">2 / 5 TASKS</p>
                   </div>
                   <CyberButton size="sm" variant="ghost" disabled>CLAIM FTP</CyberButton>
                 </div>
               </div>
             </CyberCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatTrainer({ label, value, onIncrement, disabled }: any) {
  return (
    <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded flex justify-between items-center group hover:border-cyan-500/40 transition-all">
      <div className="flex flex-col">
        <span className="font-mono text-xs text-cyan-500/60">{label}</span>
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

function KaizenSlider({ label, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-mono uppercase tracking-tighter">
        <span className="text-cyan-500/60">{label}</span>
        <span className="text-cyan-400">{value}</span>
      </div>
      <Slider 
        value={[value]} 
        max={100} 
        min={1} 
        step={1} 
        onValueChange={onChange}
        className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-400" 
      />
    </div>
  );
}

function QuestRow({ label, current, target, onPlus, unit = "" }: any) {
  const isDone = current >= target;
  return (
    <div className="flex items-center gap-4 group">
      <span className="flex-1 font-display text-white text-lg tracking-wide">{label}</span>
      <span className={`font-mono text-lg ${isDone ? 'text-green-400' : 'text-cyan-400/80'}`}>
        [{current}/{target}{unit}]
      </span>
      <button 
        onClick={onPlus}
        disabled={isDone}
        className={`w-6 h-6 border flex items-center justify-center transition-all ${
          isDone ? 'border-green-500 text-green-500 opacity-50' : 'border-white/40 text-white/40 hover:border-cyan-500 hover:text-cyan-500'
        }`}
      >
        {isDone ? <CheckCircle2 size={12} /> : <Plus size={12} />}
      </button>
    </div>
  );
}

function DisciplineTask({ label, completed = false }: { label: string, completed?: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 border transition-all ${
      completed ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-white/5 bg-white/5 opacity-40'
    }`}>
      <div className={`w-4 h-4 border flex items-center justify-center ${
        completed ? 'border-cyan-400 text-cyan-400' : 'border-white/40'
      }`}>
        {completed && <CheckCircle2 size={10} />}
      </div>
      <span className="text-xs font-display text-white uppercase tracking-tight">{label}</span>
    </div>
  );
}
