import { Layout } from "@/components/layout/Layout";
import { CyberCard } from "@/components/ui/CyberCard";
import { CyberButton } from "@/components/ui/CyberButton";
import { useProfile } from "@/hooks/use-profile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Camera, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

const DEFAULT_AVATARS = [
  `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=kaios1&backgroundColor=0d0d1a`,
  `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=kaios2&backgroundColor=0d0d1a`,
  `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=kaios3&backgroundColor=0d0d1a`,
  `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=kaios4&backgroundColor=0d0d1a`,
  `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=kaios5&backgroundColor=0d0d1a`,
  `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=kaios6&backgroundColor=0d0d1a`,
];

const GENDERS = [
  { value: "male", label: "MALE" },
  { value: "female", label: "FEMALE" },
  { value: "other", label: "OTHER" },
  { value: "unspecified", label: "UNSPECIFIED" },
];

const identitySchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  username: z.string().min(3, "Minimum 3 characters").regex(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, _ and - only").optional().or(z.literal("")),
  bio: z.string().optional(),
  gender: z.string().optional(),
  avatarUrl: z.string().optional(),
});

type IdentityValues = z.infer<typeof identitySchema>;

function getRank(level: number) {
  if (level >= 121) return "S";
  if (level >= 81) return "A";
  if (level >= 56) return "B";
  if (level >= 26) return "C";
  if (level >= 11) return "D";
  return "E";
}

const RANK_COLORS: Record<string, string> = {
  S: "text-red-500 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]",
  A: "text-orange-400 border-orange-400",
  B: "text-purple-400 border-purple-400",
  C: "text-blue-400 border-blue-400",
  D: "text-green-400 border-green-400",
  E: "text-zinc-400 border-zinc-500",
};

export default function ProfilePage() {
  const { profile, isLoading } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState("");
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (data: IdentityValues) => {
      const res = await apiRequest("PATCH", "/api/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "IDENTITY SYNCHRONIZED", description: "Profile updated successfully.", className: "border-primary text-primary font-mono" });
    },
    onError: (err: Error) => {
      toast({ title: "UPDATE FAILED", description: err.message, variant: "destructive" });
    },
  });

  const form = useForm<IdentityValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      displayName: "",
      username: "",
      bio: "",
      gender: "unspecified",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : ""),
        username: profile.username || "",
        bio: profile.bio || "",
        gender: profile.gender || "unspecified",
        avatarUrl: profile.avatarUrl || "",
      });
      setAvatarPreview(profile.avatarUrl || "");
    }
  }, [profile, form, user]);

  const handleAvatarSelect = (url: string) => {
    setAvatarPreview(url);
    form.setValue("avatarUrl", url);
    setCustomUrlInput("");
    setShowAvatarPicker(false);
  };

  const handleCustomUrl = () => {
    if (customUrlInput.trim()) {
      setAvatarPreview(customUrlInput.trim());
      form.setValue("avatarUrl", customUrlInput.trim());
    }
  };

  const onSubmit = (data: IdentityValues) => {
    updateMutation.mutate({ ...data, avatarUrl: avatarPreview || data.avatarUrl });
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

  const hunterId = `KAI-${user?.id?.toString().padStart(8, "0")}`;
  const level = profile?.level || 1;
  const experience = profile?.experience || 0;
  const rank = getRank(level);
  const rankColors = RANK_COLORS[rank] || RANK_COLORS.E;
  const getNextLevelXp = (lvl: number) => Math.floor(150 * Math.pow(1.10, lvl));
  const xpNeeded = getNextLevelXp(level);
  const xpProgress = Math.min(100, (experience / xpNeeded) * 100);

  const displayName = profile?.displayName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "OPERATOR");
  const currentAvatar = avatarPreview || profile?.avatarUrl || "";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
        {/* IDENTITY HEADER */}
        <div className="relative border border-primary/30 bg-black/60 overflow-hidden p-6">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" />

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-36 h-36 border-2 border-primary/60 relative group">
                <div className="w-full h-full bg-primary/5 overflow-hidden">
                  {currentAvatar ? (
                    <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-brand text-4xl text-primary/40">{displayName?.[0]?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-primary"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>
              <div className="text-[8px] font-mono text-primary/40 text-center mt-1 uppercase tracking-widest">
                Hover to change
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 w-full text-center md:text-left space-y-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-brand text-white tracking-widest uppercase leading-tight">{displayName}</h1>
                  {profile?.username && (
                    <p className="font-mono text-primary/60 text-sm mt-0.5">@{profile.username}</p>
                  )}
                  <p className="font-mono text-primary/30 text-xs mt-0.5 tracking-widest">ID: {hunterId}</p>
                </div>
                <div className={`border-2 w-16 h-16 flex items-center justify-center font-brand text-3xl mx-auto md:mx-0 ${rankColors}`}>
                  {rank}
                </div>
              </div>

              {/* XP bar */}
              <div className="max-w-md">
                <div className="flex justify-between text-[10px] font-mono text-primary/60 uppercase mb-1">
                  <span>Level {level}</span>
                  <span>{experience} / {xpNeeded} XP</span>
                </div>
                <div className="h-2 bg-primary/5 border border-primary/20 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-primary shadow-[0_0_8px_rgba(0,229,255,0.5)]"
                  />
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                <div>
                  <div className="text-[9px] font-mono text-primary/40 uppercase tracking-widest">Class</div>
                  <div className="font-display text-primary text-xs uppercase tracking-wide">{profile?.currentClass}</div>
                </div>
                <div>
                  <div className="text-[9px] font-mono text-primary/40 uppercase tracking-widest">Title</div>
                  <div className="font-display text-white text-xs uppercase tracking-wide">{profile?.currentTitle}</div>
                </div>
                {profile?.gender && profile.gender !== "unspecified" && (
                  <div>
                    <div className="text-[9px] font-mono text-primary/40 uppercase tracking-widest">Gender</div>
                    <div className="font-display text-white/60 text-xs uppercase">{profile.gender}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Picker (expandable) */}
        {showAvatarPicker && (
          <CyberCard className="p-5">
            <h3 className="text-[10px] font-mono text-primary/60 uppercase tracking-widest mb-4">Select Profile Image</h3>
            <div className="grid grid-cols-6 gap-3 mb-4">
              {DEFAULT_AVATARS.map((url, i) => (
                <button
                  key={i}
                  onClick={() => handleAvatarSelect(url)}
                  className={`aspect-square border-2 overflow-hidden transition-all ${
                    currentAvatar === url ? "border-primary shadow-[0_0_8px_rgba(0,229,255,0.4)]" : "border-white/10 hover:border-primary/40"
                  }`}
                >
                  <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="Paste custom image URL..."
                className="bg-black border-primary/20 text-white font-mono text-xs h-10"
              />
              <CyberButton size="sm" onClick={handleCustomUrl} variant="secondary">Apply</CyberButton>
            </div>
          </CyberCard>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Identity Form */}
          <div className="lg:col-span-2">
            <CyberCard title="IDENTITY CONFIGURATION" variant="neon">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Display Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-black/40 border-primary/20 text-white font-mono h-11 focus:border-primary rounded-none" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Callsign (Username)</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-black/40 border-primary/20 text-primary font-mono h-11 focus:border-primary rounded-none uppercase tracking-widest" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Gender */}
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Gender</FormLabel>
                        <div className="grid grid-cols-4 gap-2">
                          {GENDERS.map((g) => (
                            <button
                              key={g.value}
                              type="button"
                              onClick={() => field.onChange(g.value)}
                              className={`py-2.5 border text-[10px] font-mono uppercase tracking-wide transition-all ${
                                field.value === g.value
                                  ? "border-primary text-primary bg-primary/10"
                                  : "border-white/10 text-white/30 hover:border-primary/30 hover:text-white/50"
                              }`}
                            >
                              {g.label}
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Bio */}
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-mono uppercase tracking-widest text-primary/60">System Log (Bio)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ""}
                            className="bg-black/40 border-primary/20 text-primary/80 font-mono resize-none focus:border-primary rounded-none"
                            placeholder="Awaiting operator log entry..."
                            rows={4}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <CyberButton type="submit" isLoading={updateMutation.isPending} className="w-full md:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    SYNCHRONIZE IDENTITY
                  </CyberButton>
                </form>
              </Form>
            </CyberCard>
          </div>

          {/* Stats Summary */}
          <div className="space-y-4">
            <CyberCard title="CORE STATS" variant="neon">
              <div className="space-y-3">
                {[
                  { label: "INT", value: profile?.intelligence || 0, color: "text-cyan-400" },
                  { label: "STR", value: profile?.strength || 0, color: "text-red-400" },
                  { label: "CHA", value: profile?.charisma || 0, color: "text-yellow-400" },
                  { label: "SEN", value: profile?.sense || 0, color: "text-pink-400" },
                  { label: "AGI", value: profile?.agility || 0, color: "text-green-400" },
                  { label: "VIT", value: profile?.vitality || 0, color: "text-orange-400" },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold uppercase ${stat.color}`}>{stat.label}</span>
                    <div className="flex-1 mx-3 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stat.color.replace("text-", "bg-")}/60`}
                        style={{ width: `${Math.min(100, (stat.value / 500) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-white/40 w-8 text-right">{stat.value}</span>
                  </div>
                ))}
              </div>
            </CyberCard>

            <CyberCard className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Merit Points</span>
                  <span className="text-accent font-bold">{profile?.disciplinePoints || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Streak</span>
                  <span className="text-orange-400 font-bold">{profile?.disciplineStreak || 0}d</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Z-Coins</span>
                  <span className="text-yellow-500 font-bold">{profile?.zCoins || 0} ZC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Favor</span>
                  <span className="text-yellow-300 font-bold">{profile?.favorPoints || 0}</span>
                </div>
              </div>
            </CyberCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}
