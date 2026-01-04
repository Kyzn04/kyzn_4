import { useProfile } from "@/hooks/use-profile";
import { Layout } from "@/components/layout/Layout";
import { CyberCard } from "@/components/ui/CyberCard";
import { CyberButton } from "@/components/ui/CyberButton";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Trophy, Star, Utensils, Tv, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Rewards() {
  const { profile, isLoading } = useProfile();
  const { toast } = useToast();

  const claimRewardMutation = useMutation({
    mutationFn: async (rewardType: string) => {
      const res = await apiRequest("POST", "/api/profile/claim-reward", { type: rewardType });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "REWARD SECURED",
        description: "SYSTEM PRIVILEGE GRANTED.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "ACCESS DENIED",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const questProgress = profile?.questProgress as any;
  const completedCount = questProgress ? Object.values(questProgress).filter((v: any) => v >= 1).length : 0;
  const isEligible = completedCount >= 10 && !profile?.rewardClaimedToday;

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="border-b border-border/50 pb-6">
          <h1 className="text-4xl font-display font-black text-white">SYSTEM PRIVILEGES</h1>
          <p className="text-primary font-mono text-sm tracking-widest uppercase">
            REWARDS ARE EARNED THROUGH ABSOLUTE DISCIPLINE
          </p>
        </div>

        {!isEligible ? (
          <CyberCard variant="neon" className="text-center py-20">
            <h2 className="text-2xl font-display text-primary mb-4">
              {profile?.rewardClaimedToday ? "PRIVILEGE EXHAUSTED" : "INSUFFICIENT MERIT"}
            </h2>
            <p className="text-muted-foreground font-mono">
              {profile?.rewardClaimedToday 
                ? "COME BACK TOMORROW AFTER RESET." 
                : `COMPLETE 10/10 DAILY QUESTS TO UNLOCK. CURRENT: ${completedCount}/10`}
            </p>
          </CyberCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RewardCard 
              title="Entertainment Protocol" 
              description="1 episode of anime" 
              icon={<Tv className="w-8 h-8" />}
              onClick={() => claimRewardMutation.mutate("anime")}
              disabled={claimRewardMutation.isPending}
            />
            <RewardCard 
              title="Nutrient Surplus" 
              description="One food reward worth ₱200" 
              icon={<Utensils className="w-8 h-8" />}
              onClick={() => claimRewardMutation.mutate("food")}
              disabled={claimRewardMutation.isPending}
            />
            <RewardCard 
              title="Merit Acquisition" 
              description="Discipline Points + Streak Boost" 
              icon={<Star className="w-8 h-8" />}
              onClick={() => claimRewardMutation.mutate("merit")}
              disabled={claimRewardMutation.isPending}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

function RewardCard({ title, description, icon, onClick, disabled }: any) {
  return (
    <CyberCard variant="neon" className="group hover-elevate transition-all">
      <div className="flex flex-col items-center text-center p-6 space-y-4">
        <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-black transition-all">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-display font-bold text-white uppercase">{title}</h3>
          <p className="text-sm font-mono text-primary/60 mt-1">{description}</p>
        </div>
        <CyberButton 
          variant="outline" 
          className="w-full mt-4" 
          onClick={onClick}
          disabled={disabled}
        >
          CLAIM PRIVILEGE
        </CyberButton>
      </div>
    </CyberCard>
  );
}
