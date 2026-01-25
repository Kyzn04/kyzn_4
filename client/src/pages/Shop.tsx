import { useProfile } from "@/hooks/use-profile";
import { Layout } from "@/components/layout/Layout";
import { CyberCard } from "@/components/ui/CyberCard";
import { CyberButton } from "@/components/ui/CyberButton";
import { Zap, ShoppingCart, Shield, Sparkles, Lock, Timer } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const SHOP_ITEMS = [
  {
    id: "focus_surge",
    name: "Focus Surge",
    description: "+15% XP from Deep Work Flow (1 Day)",
    cost: 2,
    category: "Focus & Performance",
    icon: Sparkles,
  },
  {
    id: "streak_seal",
    name: "Streak Seal",
    description: "Preserves Daily Quest streak once",
    cost: 3,
    category: "Protection",
    icon: Shield,
  },
  {
    id: "flow_anchor",
    name: "Flow Anchor",
    description: "Prevents XP decay from 1 missed task",
    cost: 4,
    category: "Focus & Performance",
    icon: Timer,
  },
  {
    id: "temporal_grace",
    name: "Temporal Grace",
    description: "Converts a failed day into a Neutral Day",
    cost: 5,
    category: "Protection",
    icon: Lock,
  }
];

export default function Shop() {
  const { profile, isLoading } = useProfile();
  const { toast } = useToast();

  const buyMutation = useMutation({
    mutationFn: async (item: typeof SHOP_ITEMS[0]) => {
      const res = await apiRequest("POST", "/api/shop/buy", { itemId: item.id });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "SYSTEM ACQUISITION COMPLETE",
        description: "Item added to your inventory.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "TRANSACTION FAILED",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (isLoading) return null;

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex justify-between items-end border-b border-border/50 pb-6">
          <div>
            <h1 className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-2 uppercase">
              System Shop
            </h1>
            <p className="text-primary font-mono text-sm tracking-widest uppercase">
              Exchange Z-Coins for system advantages
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Balance</div>
            <div className="text-2xl font-display font-bold text-yellow-500 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {profile?.zCoins || 0} ZC
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOP_ITEMS.map((item) => (
            <CyberCard key={item.id} className="group relative overflow-hidden h-full flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase px-2 py-0.5 border border-border rounded">
                      {item.category}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-wide">
                  {item.name}
                </h3>
                <p className="text-sm text-muted-foreground font-mono leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>
              <div className="p-6 pt-0 mt-auto">
                <CyberButton 
                  className="w-full" 
                  variant={(profile?.zCoins || 0) >= item.cost ? "primary" : "outline"}
                  disabled={buyMutation.isPending || (profile?.zCoins || 0) < item.cost}
                  onClick={() => buyMutation.mutate(item)}
                >
                  <div className="flex items-center justify-between w-full px-4">
                    <span>ACQUIRE</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Zap className="w-3 h-3" />
                      {item.cost}
                    </span>
                  </div>
                </CyberButton>
              </div>
            </CyberCard>
          ))}
        </div>
      </div>
    </Layout>
  );
}
