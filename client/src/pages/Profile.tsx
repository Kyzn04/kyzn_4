import { Layout } from "@/components/layout/Layout";
import { CyberCard } from "@/components/ui/CyberCard";
import { CyberButton } from "@/components/ui/CyberButton";
import { useProfile } from "@/hooks/use-profile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProfileSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Shield, Zap, Activity, Brain, Eye, Disc, Terminal } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const formSchema = insertProfileSchema.pick({
  intelligence: true,
  strength: true,
  charisma: true,
  sense: true,
  agility: true,
  vitality: true,
  bio: true,
  currentClass: true,
}).extend({
  intelligence: z.coerce.number().min(0).max(500),
  strength: z.coerce.number().min(0).max(500),
  charisma: z.coerce.number().min(0).max(500),
  sense: z.coerce.number().min(0).max(500),
  agility: z.coerce.number().min(0).max(500),
  vitality: z.coerce.number().min(0).max(500),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProfilePage() {
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      intelligence: 10,
      strength: 10,
      charisma: 10,
      sense: 10,
      agility: 10,
      vitality: 10,
      bio: "",
      currentClass: "Civilian",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        intelligence: profile.intelligence,
        strength: profile.strength,
        charisma: profile.charisma,
        sense: profile.sense,
        agility: profile.agility,
        vitality: profile.vitality,
        bio: profile.bio || "",
        currentClass: profile.currentClass,
      });
    }
  }, [profile, form]);

  const onSubmit = (data: FormValues) => {
    updateProfile(data);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="h-[50vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const hunterId = `ID-${user?.id?.toString().padStart(8, '0')}`;
  const level = profile?.level || 1;
  const experience = profile?.experience || 0;
  
  const getRank = (lvl: number) => {
    if (lvl >= 100) return "S";
    if (lvl >= 80) return "A";
    if (lvl >= 60) return "B";
    if (lvl >= 40) return "C";
    if (lvl >= 20) return "D";
    return "E";
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
        {/* HEADER HUD SECTION */}
        <div className="relative p-6 bg-black/60 border border-cyan-500/30 rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.1)] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20" />
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Portrait */}
            <div className="relative shrink-0">
              <div className="w-40 h-40 border-2 border-cyan-400 p-1 relative">
                <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                <div className="w-full h-full bg-cyan-900/20 overflow-hidden relative group">
                  <img src="/kyzn-avatar.png" alt="Hunter Portrait" className="w-full h-full object-cover grayscale brightness-110" />
                  <div className="absolute inset-0 bg-cyan-500/10 mix-blend-screen opacity-50" />
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(0,229,255,0.1)_50%,transparent_100%)] bg-[length:100%_4px] animate-scanline" />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-display font-black text-white tracking-widest uppercase">{user?.firstName} {user?.lastName}</h1>
                  <p className="font-mono text-cyan-400/80 text-sm mt-1 tracking-tighter">ID: {hunterId}</p>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest">Hunter Rank</div>
                  <div className="text-5xl font-display font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]">{getRank(level)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-cyan-400/80 uppercase">
                    <span>XP (Progress)</span>
                    <span>{experience % 100} / 100</span>
                  </div>
                  <div className="h-3 bg-cyan-950/40 border border-cyan-500/20 rounded-full overflow-hidden p-[1px]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${experience % 100}%` }}
                      className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.4)]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-cyan-400/80 uppercase">
                    <span>Level</span>
                    <span>{level}</span>
                  </div>
                  <div className="h-3 bg-cyan-950/40 border border-cyan-500/20 rounded-full overflow-hidden p-[1px]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      className="h-full bg-gradient-to-r from-cyan-800 to-cyan-600 shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-2 justify-center md:justify-start">
                <div>
                  <div className="text-[10px] font-mono text-cyan-500/60 uppercase">Guild</div>
                  <div className="text-white font-display text-sm uppercase">N/A</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-cyan-500/60 uppercase">Class</div>
                  <div className="text-white font-display text-sm uppercase">{profile?.currentClass}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-cyan-500/60 uppercase">Title</div>
                  <div className="text-white font-display text-sm uppercase">{profile?.currentTitle}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* STATS PANEL */}
          <div className="lg:col-span-2 space-y-6">
            <CyberCard title="ATTRIBUTES" variant="neon" className="border-cyan-500/30">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <AttributeRow form={form} name="strength" label="Strength" icon={<Shield className="w-4 h-4" />} color="text-cyan-400" />
                    <AttributeRow form={form} name="agility" label="Agility" icon={<Zap className="w-4 h-4" />} color="text-cyan-400" />
                    <AttributeRow form={form} name="vitality" label="Vitality" icon={<Activity className="w-4 h-4" />} color="text-cyan-400" />
                    <AttributeRow form={form} name="intelligence" label="Intelligence" icon={<Brain className="w-4 h-4" />} color="text-cyan-400" />
                    <AttributeRow form={form} name="sense" label="Perception" icon={<Eye className="w-4 h-4" />} color="text-cyan-400" />
                    <AttributeRow form={form} name="charisma" label="Mana Control" icon={<Disc className="w-4 h-4" />} color="text-cyan-400" />
                  </div>

                  <div className="pt-6 border-t border-cyan-500/10">
                    <h4 className="text-[10px] font-mono text-cyan-500/60 uppercase mb-4 tracking-widest">Biometric Log (BIO)</h4>
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              value={field.value || ""} 
                              className="bg-black/40 border-cyan-500/20 text-cyan-100 font-mono resize-none focus:border-cyan-400" 
                              placeholder="Awaiting system log entry..." 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <CyberButton type="submit" isLoading={isUpdating} className="w-full md:w-auto bg-cyan-500/10 border-cyan-500 text-cyan-400 hover:bg-cyan-500">
                      <Save className="w-4 h-4 mr-2" />
                      SYNCHRONIZE SYSTEM
                    </CyberButton>
                  </div>
                </form>
              </Form>
            </CyberCard>

            {/* EQUIPMENT PANEL */}
            <CyberCard title="EQUIPMENT EFFECTS" className="border-cyan-500/20 bg-black/40">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <EquipmentItem label="Ring" effect="+Strength" />
                <EquipmentItem label="Bracelet" effect="+Mana Control" />
                <EquipmentItem label="Armor" effect="+Vitality" />
              </div>
            </CyberCard>
          </div>

          {/* SKILLS PANEL */}
          <div className="space-y-6">
            <CyberCard title="SKILLS & TRAITS" variant="neon" className="border-cyan-500/30 h-full">
              <div className="space-y-4">
                <SkillItem rank="F" type="Active" name="Resource Collection" unlocked />
                <SkillItem rank="E" type="Passive" name="Latent Awakening" unlocked />
                <SkillItem rank="S" type="Active" name="Monarch's Tempest" />
                <SkillItem rank="S" type="Hidden" name="Evolution Authority" />
                <SkillItem rank="?" type="Unknown" name="[DATA ENCRYPTED]" />
              </div>
            </CyberCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function AttributeRow({ form, name, label, icon, color }: any) {
  const value = form.watch(name);
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          <div className="flex items-center justify-between">
            <FormLabel className={cn("text-xs font-mono uppercase tracking-widest flex items-center gap-2", color)}>
              {icon} {label}
            </FormLabel>
            <span className="text-[10px] font-mono text-cyan-500/40">BASE: {value}</span>
          </div>
          <FormControl>
            <div className="relative group">
              <Input type="number" {...field} className="bg-cyan-950/20 border-cyan-500/20 text-white font-mono h-9 focus:border-cyan-400 transition-colors" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-cyan-400">+0</div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function EquipmentItem({ label, effect }: { label: string, effect: string }) {
  return (
    <div className="p-3 border border-cyan-500/10 bg-cyan-950/10 rounded">
      <div className="text-[10px] font-mono text-cyan-500/60 uppercase">{label}</div>
      <div className="text-xs font-display text-cyan-400">{effect}</div>
    </div>
  );
}

function SkillItem({ rank, type, name, unlocked = false }: { rank: string, type: string, name: string, unlocked?: boolean }) {
  return (
    <div className={cn(
      "p-3 border-l-2 flex items-center gap-4 transition-all",
      unlocked ? "border-cyan-400 bg-cyan-500/5" : "border-white/10 opacity-40 bg-white/5 grayscale"
    )}>
      <div className={cn(
        "w-10 h-10 shrink-0 flex items-center justify-center font-display font-black text-xl border-2",
        rank === 'S' ? "text-yellow-400 border-yellow-400/50" : "text-cyan-400 border-cyan-400/50"
      )}>
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest">{type}</div>
        <div className="text-sm font-display text-white truncate uppercase tracking-tight">{name}</div>
      </div>
      {!unlocked && <Terminal className="w-4 h-4 text-white/20" />}
    </div>
  );
}
