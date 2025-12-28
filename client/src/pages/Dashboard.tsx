import { useProfile } from "@/hooks/use-profile";
import { Layout } from "@/components/layout/Layout";
import { CyberCard } from "@/components/ui/CyberCard";
import { StatRadar } from "@/components/dashboard/StatRadar";
import { CyberButton } from "@/components/ui/CyberButton";
import { Link } from "wouter";
import { Activity, Zap, Shield, Brain, Trophy, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { profile, isLoading } = useProfile();
  const { user } = useAuth();

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

  // Fallback if profile creation failed or isn't ready
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

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CyberCard className="bg-primary/5 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg border border-primary/40">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Current Class</p>
                <h3 className="text-2xl font-display font-bold text-white">{profile.currentClass}</h3>
              </div>
            </div>
          </CyberCard>
          
          <CyberCard className="bg-secondary/5 border-secondary/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/20 rounded-lg border border-secondary/40">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Rank Title</p>
                <h3 className="text-2xl font-display font-bold text-white">{profile.currentTitle}</h3>
              </div>
            </div>
          </CyberCard>
          
          <CyberCard className="bg-accent/5 border-accent/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/20 rounded-lg border border-accent/40">
                <Zap className="w-8 h-8 text-accent" />
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Level Progress</p>
                <h3 className="text-2xl font-display font-bold text-white">45%</h3>
              </div>
            </div>
            {/* Progress bar decoration */}
            <div className="mt-4 h-1 w-full bg-background rounded-full overflow-hidden">
              <div className="h-full bg-accent w-[45%] relative">
                <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_white]" />
              </div>
            </div>
          </CyberCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Radar */}
          <div className="lg:col-span-1">
            <CyberCard title="ATTRIBUTES" className="h-full">
              <StatRadar stats={profile} />
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-3 bg-muted/30 border border-border rounded flex justify-between items-center">
                  <span className="font-mono text-xs text-muted-foreground">INT</span>
                  <span className="font-display font-bold text-primary">{profile.intelligence}</span>
                </div>
                <div className="p-3 bg-muted/30 border border-border rounded flex justify-between items-center">
                  <span className="font-mono text-xs text-muted-foreground">STR</span>
                  <span className="font-display font-bold text-secondary">{profile.strength}</span>
                </div>
                <div className="p-3 bg-muted/30 border border-border rounded flex justify-between items-center">
                  <span className="font-mono text-xs text-muted-foreground">CHA</span>
                  <span className="font-display font-bold text-accent">{profile.charisma}</span>
                </div>
                <div className="p-3 bg-muted/30 border border-border rounded flex justify-between items-center">
                  <span className="font-mono text-xs text-muted-foreground">VIT</span>
                  <span className="font-display font-bold text-white">{profile.vitality}</span>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Link href="/profile">
                  <CyberButton variant="ghost" size="sm" className="w-full">Manage Stats</CyberButton>
                </Link>
              </div>
            </CyberCard>
          </div>

          {/* Recent Activity / Quests */}
          <div className="lg:col-span-2 space-y-8">
             <CyberCard title="ACTIVE QUESTS" variant="neon">
               <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="group p-4 bg-muted/10 border border-border hover:border-primary/50 rounded transition-all flex items-center gap-4">
                     <div className="w-12 h-12 rounded bg-background border border-border flex items-center justify-center shrink-0">
                       <Activity className="text-muted-foreground group-hover:text-primary transition-colors" />
                     </div>
                     <div className="flex-1">
                       <h4 className="font-display font-bold text-sm group-hover:text-primary transition-colors">DAILY PROTOCOL #{i}</h4>
                       <p className="text-xs text-muted-foreground line-clamp-1">Complete the mandatory physical training module to increase VIT stats.</p>
                     </div>
                     <div className="text-right">
                       <span className="text-xs font-mono text-accent block">+10 XP</span>
                       <span className="text-xs font-mono text-muted-foreground block">2h left</span>
                     </div>
                   </div>
                 ))}
               </div>
               <div className="mt-6 text-right">
                 <CyberButton size="sm">View All Logs</CyberButton>
               </div>
             </CyberCard>

             <CyberCard title="SKILL PROGRESSION">
               <div className="relative p-6 bg-muted/10 border border-border rounded min-h-[200px] flex flex-col items-center justify-center text-center">
                 <Brain className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                 <p className="text-muted-foreground font-mono text-sm max-w-md">
                   Neural interface active. Access the Skill Tree to unlock new abilities and specializations based on your attribute points.
                 </p>
                 <div className="mt-6">
                   <Link href="/skills">
                     <CyberButton variant="secondary">Access Neural Net</CyberButton>
                   </Link>
                 </div>
               </div>
             </CyberCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}
