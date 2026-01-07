import { Layout } from "@/components/layout/Layout";
import { CyberCard } from "@/components/ui/CyberCard";
import { CyberButton } from "@/components/ui/CyberButton";
import { useProfile } from "@/hooks/use-profile";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Gift, Tv, Coffee, Trophy, CheckCircle2 } from "lucide-react";

export default function Rewards() {
  const { profile, isLoading } = useProfile();
  const { toast } = useToast();
  const [selectedReward, setSelectedReward] = useState<string | null>(null);

  const claimMutation = useMutation({
    mutationFn: async (type: string) => {
      const res = await apiRequest("POST", "/api/profile/claim-reward", { type });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "REWARD SECURED", description: "SYSTEM PRIVILEGE GRANTED." });
    },
    onError: (err: any) => {
      toast({ title: "ERROR", description: err.message, variant: "destructive" });
    }
  });

  if (isLoading) return null;

  const questProgress = profile?.questProgress as any;
  const completedCount = Object.values(questProgress || {}).filter((v: any) => typeof v === 'number' && v >= 1).length;
  const isEligible = completedCount >= 10 && !profile?.rewardClaimedToday;
  const options = [
    {
      id: "anime",
      title: "Entertainment Protocol",
      description: "1 Episode of Anime",
      icon: <Tv className="w-8 h-8" />,
      details: "SYSTEM GRANTED DOWNTIME"
    },
    {
      id: "food",
      title: "Nutrition Supply",
      description: "₱200 Food Reward",
      icon: <Coffee className="w-8 h-8" />,
      details: "SYSTEM FUNDED SUBSISTENCE"
    },
    {
      id: "merit",
      title: "System Authority",
      description: "+10 Discipline Points",
      icon: <Gift className="w-8 h-8" />,
      details: "DIRECT STAT BOOST + STREAK +1"
    }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-display font-black text-white tracking-[0.2em] text-glow">SYSTEM PRIVILEGE</h1>
          <p className="text-primary/60 font-mono text-xs tracking-widest uppercase italic">Unauthorized access will be penalized. Daily compensation ready.</p>
        </div>

        {!isEligible ? (
          <CyberCard className="text-center py-20 border-white/10 bg-black/60 backdrop-blur-md">
            <Trophy className="w-16 h-16 text-white/5 mx-auto mb-4" />
            <h2 className="text-xl font-display text-white/40 tracking-widest">ACCESS RESTRICTED</h2>
            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-white/20 font-mono text-sm uppercase">
                {profile?.rewardClaimedToday 
                  ? "DAILY PRIVILEGE ALREADY EXHAUSTED." 
                  : `INSUFFICIENT MERIT: ${completedCount}/10 OBJECTIVES COMPLETED.`}
              </p>
              <div className="h-1 w-32 bg-white/5 overflow-hidden">
                <div 
                  className="h-full bg-primary/20 transition-all duration-1000" 
                  style={{ width: `${(completedCount / 10) * 100}%` }}
                />
              </div>
            </div>
          </CyberCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {options.map(opt => (
              <RewardCard 
                key={opt.id}
                id={opt.id}
                title={opt.title}
                description={opt.description}
                details={opt.details}
                icon={opt.icon}
                selected={selectedReward === opt.id}
                onClick={() => setSelectedReward(opt.id)}
              />
            ))}
          </div>
        )}

        {isEligible && selectedReward && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center pt-8"
          >
            <CyberButton 
              size="lg" 
              className="w-full max-w-sm"
              onClick={() => claimMutation.mutate(selectedReward)}
              isLoading={claimMutation.isPending}
            >
              CLAIM SELECTED PRIVILEGE
            </CyberButton>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}

function RewardCard({ id, title, description, icon, selected, onClick, details }: any) {
  return (
    <div 
      onClick={onClick}
      className={`relative p-6 border-2 transition-all cursor-pointer group ${
        selected 
          ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(0,229,255,0.2)]' 
          : 'border-white/10 bg-black/40 hover:border-white/20'
      }`}
    >
      <div className={`mb-4 transition-colors ${selected ? 'text-primary' : 'text-white/40 group-hover:text-white/60'}`}>
        {icon}
      </div>
      <h3 className="font-display font-bold text-white mb-1 uppercase tracking-wider">{title}</h3>
      <p className="text-[10px] font-mono text-muted-foreground uppercase">{description}</p>
      {details && <p className="text-[8px] font-mono text-primary/40 mt-2 uppercase tracking-tighter">{details}</p>}
      {selected && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
        </div>
      )}
    </div>
  );
}
