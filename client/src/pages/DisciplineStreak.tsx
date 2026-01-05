import { Layout } from "@/components/layout/Layout";
import { CyberCard } from "@/components/ui/CyberCard";
import { useProfile } from "@/hooks/use-profile";
import { useQuery } from "@tanstack/react-query";
import { Flame, Trophy, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function DisciplineStreak() {
  const { profile } = useProfile();
  const { data: transcripts, isLoading } = useQuery({
    queryKey: ["/api/profile/transcripts"],
  });

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="border-b border-border/50 pb-6">
          <h1 className="text-4xl font-display font-black text-white">ACCOUNTABILITY ARCHIVE</h1>
          <p className="text-primary font-mono text-sm tracking-widest uppercase">
            IMMUTABLE RECORDS OF DAILY PERFORMANCE
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatBox 
            label="Current Streak" 
            value={profile?.disciplineStreak || 0} 
            icon={<Flame className="text-orange-500" />} 
          />
          <StatBox 
            label="Longest Streak" 
            value={profile?.longestStreak || 0} 
            icon={<Trophy className="text-yellow-500" />} 
          />
          <StatBox 
            label="Disciplined Days" 
            value={profile?.totalDisciplinedDays || 0} 
            icon={<Calendar className="text-primary" />} 
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">Daily Transcripts</h2>
          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center font-mono text-primary/40 animate-pulse">RETRIVING ARCHIVES...</div>
            ) : !Array.isArray(transcripts) || transcripts.length === 0 ? (
              <div className="text-center font-mono text-white/20 py-10 border border-white/5 bg-white/5">NO RECORDS FOUND.</div>
            ) : (
              transcripts.map((log: any) => (
                <TranscriptRow key={log.id} log={log} />
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatBox({ label, value, icon }: any) {
  return (
    <CyberCard className="bg-black/40 border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase">{label}</p>
          <p className="text-3xl font-display font-black text-white mt-1">{value}</p>
        </div>
        <div className="p-3 bg-white/5 rounded-full">{icon}</div>
      </div>
    </CyberCard>
  );
}

function TranscriptRow({ log }: any) {
  return (
    <div className={`p-4 border-l-4 bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
      log.isDisciplined ? 'border-primary' : 'border-red-500/50'
    }`}>
      <div>
        <p className="text-xs font-mono text-white/40">{format(new Date(log.date), "yyyy-MM-dd")}</p>
        <p className="text-sm font-display font-bold text-white uppercase mt-1">
          {log.isDisciplined ? "DISCIPLINE SECURED" : "CRITICAL FAILURE"}
        </p>
      </div>
      
      <div className="flex-1 max-w-md">
        <div className="flex flex-wrap gap-2">
          {Object.entries(log.questSnapshot).map(([key, val]: any) => (
            <span key={key} className="text-[9px] font-mono px-1.5 py-0.5 bg-white/5 border border-white/10 text-white/60 uppercase">
              {key}: {val}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-white/60">[{log.tasksCompleted}/10]</span>
        {log.isDisciplined ? (
          <CheckCircle2 className="w-5 h-5 text-primary" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
      </div>
    </div>
  );
}
