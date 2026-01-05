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
  const completedCount = Object.values(questProgress || {}).filter((v: any) => v >= 1).length;
  const isEligible = completedCount >= 10 && !profile?.rewardClaimedToday;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-display font-black text-white tracking-[0.2em]">SYSTEM PRIVILEGE</h1>
          <p className="text-primary/60 font-mono text-xs tracking-widest uppercase">Select your daily compensation package</p>
        </div>

        {!isEligible ? (
          <CyberCard className="text-center py-20 border-white/10">
            <Trophy className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h2 className="text-xl font-display text-white/40">ACCESS RESTRICTED</h2>
            <p className="text-white/20 font-mono text-sm mt-2">
              {profile?.rewardClaimedToday 
                ? "DAILY PRIVILEGE ALREADY EXHAUSTED." 
                : `INSUFFICIENT MERIT: ${completedCount}/10 OBJECTIVES COMPLETED.`}
            </p>
          </CyberCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RewardCard 
              id="anime"
              title="Digital Escape"
              description="1 Episode of Anime"
              icon={<Tv className="w-8 h-8" />}
              selected={selectedReward === "anime"}
              onClick={() => setSelectedReward("anime")}
            />
            <RewardCard 
              id="food"
              title="Nutrient Surplus"
              description="₱200 Food Reward"
              icon={<Coffee className="w-8 h-8" />}
              selected={selectedReward === "food"}
              onClick={() => setSelectedReward("food")}
            />
            <RewardCard 
              id="merit"
              title="System Authority"
              description="+10 Discipline Points"
              icon={<Gift className="w-8 h-8" />}
              selected={selectedReward === "merit"}
              onClick={() => setSelectedReward("merit")}
            />
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

function RewardCard({ id, title, description, icon, selected, onClick }: any) {
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
      {selected && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
        </div>
      )}
    </div>
  );
}
