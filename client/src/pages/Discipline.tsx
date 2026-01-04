import { useProfile } from "@/hooks/use-profile";
import { Layout } from "@/components/layout/Layout";
import { CyberCard } from "@/components/ui/CyberCard";
import { Flame, Trophy, Calendar, CheckCircle2, AlertTriangle, History } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function Discipline() {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const questProgress = profile.questProgress as any;
  const completedCount = Object.values(questProgress || {}).filter((v: any) => v >= 1).length;
  const isSafe = completedCount >= 6;

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="border-b border-border/50 pb-6">
          <h1 className="text-4xl font-display font-black text-white">DISCIPLINE CORE</h1>
          <p className="text-primary font-mono text-sm tracking-widest uppercase">
            ACCOUNTABILITY ARCHIVE & STREAK PROTOCOL
          </p>
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="CURRENT STREAK" 
            value={profile.disciplineStreak} 
            sub="CONSECUTIVE DAYS" 
            icon={<Flame className="text-orange-500" />} 
          />
          <StatCard 
            label="LONGEST STREAK" 
            value={profile.longestStreak} 
            sub="ALL-TIME PEAK" 
            icon={<Trophy className="text-yellow-500" />} 
          />
          <StatCard 
            label="TOTAL DISCIPLINED" 
            value={profile.totalDisciplinedDays} 
            sub="TOTAL DAYS 6/10+" 
            icon={<Calendar className="text-cyan-500" />} 
          />
        </div>

        {/* Daily Transcript */}
        <CyberCard title="ACTIVE TRANSCRIPT" variant="neon">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Status</p>
                <div className={`text-lg font-display font-bold ${isSafe ? 'text-green-500' : 'text-red-500'}`}>
                  {isSafe ? "DISCIPLINED" : "PUNISHMENT STATE"}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Merit Potential</p>
                <div className="text-lg font-display font-bold text-white">
                  {completedCount}/10 OBJECTIVES
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TranscriptItem label="Flow Sessions" current={Object.keys(questProgress).filter(k => k.startsWith('flow') && questProgress[k] >= 1).length} target={7} />
              <TranscriptItem label="Push-ups" current={questProgress.push} target={35} />
              <TranscriptItem label="Sit-ups" current={questProgress.sit} target={35} />
              <TranscriptItem label="Squats" current={questProgress.squat} target={30} />
            </div>

            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded">
              <div className="flex items-center gap-2 mb-2">
                <History size={14} className="text-primary" />
                <span className="text-[10px] font-mono text-primary uppercase">System Log</span>
              </div>
              <p className="text-xs font-mono text-white/60 italic leading-relaxed">
                "Transcript finalized at 23:59:59. All performance data is immutable. 
                {isSafe ? " Discipline threshold met. Reward eligibility maintained." : " Failure detected. Penalties logged in character history."}"
              </p>
            </div>
          </div>
        </CyberCard>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, sub, icon }: any) {
  return (
    <CyberCard variant="neon" className="flex flex-col items-center text-center p-6">
      <div className="mb-4">{icon}</div>
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className="text-4xl font-display font-black text-white my-2">{value}</p>
      <p className="text-[8px] font-mono text-primary/60 uppercase">{sub}</p>
    </CyberCard>
  );
}

function TranscriptItem({ label, current, target }: any) {
  const isDone = current >= target;
  return (
    <div className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/5">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isDone ? 'bg-green-500' : 'bg-white/20'}`} />
        <span className="text-xs font-mono text-white/80">{label}</span>
      </div>
      <span className={`text-xs font-mono ${isDone ? 'text-green-500' : 'text-white/40'}`}>
        {current} / {target}
      </span>
    </div>
  );
}
