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
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Schema for form (partial updates allowed)
const formSchema = insertProfileSchema.pick({
  intelligence: true,
  strength: true,
  charisma: true,
  sense: true,
  agility: true,
  vitality: true,
  bio: true,
  currentClass: true,
  currentTitle: true
}).extend({
  intelligence: z.coerce.number().min(0).max(100),
  strength: z.coerce.number().min(0).max(100),
  charisma: z.coerce.number().min(0).max(100),
  sense: z.coerce.number().min(0).max(100),
  agility: z.coerce.number().min(0).max(100),
  vitality: z.coerce.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProfilePage() {
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
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
      currentTitle: "Novice"
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
        currentTitle: profile.currentTitle
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="border-b border-border/50 pb-6">
          <h1 className="text-4xl font-display font-black text-white mb-2">IDENTITY CONFIG</h1>
          <p className="text-muted-foreground font-mono text-sm">
            Modify base parameters and personal data. Warning: Stat modification may affect skill eligibility.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CyberCard title="CORE ATTRIBUTES" variant="neon">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="intelligence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary font-display">INTELLIGENCE (INT)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="font-mono text-lg bg-background/50 border-primary/20 focus:border-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="strength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-secondary font-display">STRENGTH (STR)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="font-mono text-lg bg-background/50 border-secondary/20 focus:border-secondary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="charisma"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-accent font-display">CHARISMA (CHA)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="font-mono text-lg bg-background/50 border-accent/20 focus:border-accent" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sense"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-display">SENSE (SEN)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="font-mono text-lg bg-background/50 border-white/20 focus:border-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="agility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-display">AGILITY (AGI)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="font-mono text-lg bg-background/50 border-white/20 focus:border-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vitality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-display">VITALITY (VIT)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="font-mono text-lg bg-background/50 border-white/20 focus:border-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CyberCard>

            <CyberCard title="CHARACTER IDENTITY" variant="neon">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative group">
                  <div className="w-32 h-32 rounded bg-primary/10 border border-primary/30 overflow-hidden relative">
                    <img src="/kyzn-avatar.png" alt="KYZN Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded rotate-3 shadow-lg">
                    VERIFIED
                  </div>
                </div>

                <div className="flex-1 w-full space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="currentClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-display text-xs text-muted-foreground uppercase tracking-widest">Job Class (Semi-Editable)</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background/50 border-primary/20 font-mono" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <FormLabel className="font-display text-xs text-muted-foreground uppercase tracking-widest">Rank Title (System Locked)</FormLabel>
                      <FormControl>
                        <Input value={profile?.currentTitle} disabled className="bg-background/20 border-white/5 font-mono text-primary shadow-inner opacity-80 cursor-not-allowed" />
                      </FormControl>
                    </FormItem>
                  </div>

                  <div className="p-4 bg-muted/20 border border-border/50 rounded-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <Terminal size={40} />
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-tighter">System Level</div>
                    <div className="text-4xl font-display font-black text-white">LVL. {Math.floor(((profile?.strength || 0) + (profile?.intelligence || 0) + (profile?.vitality || 0)) / 10)}</div>
                  </div>
                </div>
              </div>
            </CyberCard>

            <div className="flex justify-end pt-4">
              <CyberButton type="submit" size="lg" isLoading={isUpdating} className="w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" />
                SAVE CONFIGURATION
              </CyberButton>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
