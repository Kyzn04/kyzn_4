import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CyberButton } from "@/components/ui/CyberButton";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { CheckCircle2, ChevronRight, User, Image, Shield } from "lucide-react";

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
  { value: "unspecified", label: "PREFER NOT TO SAY" },
];

type Step = 1 | 2 | 3;

export default function Onboarding() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>(1);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "");
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const saveMutation = useMutation({
    mutationFn: async () => {
      const avatarUrl = customAvatarUrl.trim() || selectedAvatar;
      const res = await apiRequest("PATCH", "/api/profile", {
        username: username.trim(),
        displayName: displayName.trim(),
        gender: gender || "unspecified",
        avatarUrl,
        onboardingComplete: true,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setLocation("/");
    },
  });

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!username.trim()) errs.username = "Callsign is required";
    else if (username.trim().length < 3) errs.username = "Minimum 3 characters";
    else if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) errs.username = "Letters, numbers, _ and - only";
    if (!displayName.trim()) errs.displayName = "Display name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStep1Next = () => {
    if (validateStep1()) setStep(2);
  };

  const handleStep2Next = () => {
    setStep(3);
  };

  const handleFinish = () => {
    saveMutation.mutate();
  };

  const previewAvatar = customAvatarUrl.trim() || selectedAvatar;

  return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center relative overflow-hidden font-mono px-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.07)_0%,transparent_70%)]" />

      {/* Step indicators */}
      <div className="relative z-10 flex items-center gap-3 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-sm border flex items-center justify-center font-display font-black text-xs transition-all duration-300 ${
              step > s ? "border-primary bg-primary/20 text-primary" :
              step === s ? "border-primary text-primary shadow-[0_0_10px_rgba(0,229,255,0.3)]" :
              "border-white/10 text-white/20"
            }`}>
              {step > s ? <CheckCircle2 size={14} /> : s}
            </div>
            {s < 3 && <div className={`w-10 h-px transition-all duration-300 ${step > s ? "bg-primary/60" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* STEP 1: Identity */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="border border-primary/30 bg-black/90 backdrop-blur-3xl p-8 shadow-[0_0_40px_rgba(0,229,255,0.1)]"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/20">
                <User className="text-primary w-5 h-5" />
                <div>
                  <h2 className="text-xl font-brand text-white tracking-widest uppercase">Identity Setup</h2>
                  <p className="text-[10px] font-mono text-primary/50 uppercase tracking-widest mt-0.5">Step 1 of 3</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.3em] text-primary/60 mb-2">
                    Callsign <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setErrors(p => ({ ...p, username: "" })); }}
                    placeholder="ALPHA-01"
                    className="bg-black border-primary/30 focus:border-primary text-primary font-mono h-12 rounded-none tracking-widest uppercase"
                    data-testid="input-username"
                  />
                  {errors.username && <p className="text-red-500 text-[10px] mt-1 font-mono">{errors.username}</p>}
                  <p className="text-[9px] text-white/20 mt-1 font-mono">Your unique system identifier. Alphanumeric + _ -</p>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.3em] text-primary/60 mb-2">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => { setDisplayName(e.target.value); setErrors(p => ({ ...p, displayName: "" })); }}
                    placeholder="Your Name"
                    className="bg-black border-primary/30 focus:border-primary text-white font-mono h-12 rounded-none tracking-wide"
                    data-testid="input-display-name"
                  />
                  {errors.displayName && <p className="text-red-500 text-[10px] mt-1 font-mono">{errors.displayName}</p>}
                </div>

                <CyberButton
                  className="w-full mt-4"
                  onClick={handleStep1Next}
                  data-testid="button-next-step1"
                >
                  <span className="flex items-center gap-2">CONTINUE <ChevronRight size={14} /></span>
                </CyberButton>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Avatar */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="border border-primary/30 bg-black/90 backdrop-blur-3xl p-8 shadow-[0_0_40px_rgba(0,229,255,0.1)]"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/20">
                <Image className="text-primary w-5 h-5" />
                <div>
                  <h2 className="text-xl font-brand text-white tracking-widest uppercase">Profile Image</h2>
                  <p className="text-[10px] font-mono text-primary/50 uppercase tracking-widest mt-0.5">Step 2 of 3</p>
                </div>
              </div>

              {/* Preview */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />
                  <div className="w-24 h-24 border border-primary/40 bg-primary/5 overflow-hidden">
                    <img src={previewAvatar} alt="Avatar Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATARS[0]; }} />
                  </div>
                </div>
              </div>

              {/* Default avatars grid */}
              <div className="mb-4">
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-3">Select Default</p>
                <div className="grid grid-cols-6 gap-2">
                  {DEFAULT_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedAvatar(url); setCustomAvatarUrl(""); }}
                      className={`w-full aspect-square border-2 overflow-hidden transition-all ${
                        selectedAvatar === url && !customAvatarUrl.trim()
                          ? "border-primary shadow-[0_0_8px_rgba(0,229,255,0.4)]"
                          : "border-white/10 hover:border-primary/40"
                      }`}
                      data-testid={`button-avatar-${i}`}
                    >
                      <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom URL */}
              <div>
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-2">Or paste image URL</p>
                <Input
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-black border-primary/20 focus:border-primary text-white/70 font-mono h-10 rounded-none text-xs"
                  data-testid="input-avatar-url"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <CyberButton variant="ghost" className="flex-1" onClick={() => setStep(1)}>BACK</CyberButton>
                <CyberButton className="flex-1" onClick={handleStep2Next} data-testid="button-next-step2">
                  <span className="flex items-center gap-2">CONTINUE <ChevronRight size={14} /></span>
                </CyberButton>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Gender + Finish */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="border border-primary/30 bg-black/90 backdrop-blur-3xl p-8 shadow-[0_0_40px_rgba(0,229,255,0.1)]"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/20">
                <Shield className="text-primary w-5 h-5" />
                <div>
                  <h2 className="text-xl font-brand text-white tracking-widest uppercase">Classification</h2>
                  <p className="text-[10px] font-mono text-primary/50 uppercase tracking-widest mt-0.5">Step 3 of 3</p>
                </div>
              </div>

              {/* Preview summary */}
              <div className="mb-6 p-4 border border-primary/10 bg-primary/5 flex items-center gap-4">
                <img src={previewAvatar} alt="Avatar" className="w-14 h-14 border border-primary/30 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATARS[0]; }} />
                <div>
                  <p className="font-brand text-white text-lg tracking-widest uppercase">{displayName || "—"}</p>
                  <p className="font-mono text-primary/60 text-[10px] uppercase tracking-widest">@{username || "—"}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-mono text-primary/60 uppercase tracking-[0.3em] mb-3">Gender <span className="text-white/20">(optional)</span></p>
                <div className="grid grid-cols-2 gap-2">
                  {GENDERS.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setGender(g.value)}
                      className={`py-3 border text-[10px] font-mono uppercase tracking-widest transition-all ${
                        gender === g.value
                          ? "border-primary text-primary bg-primary/10"
                          : "border-white/10 text-white/30 hover:border-primary/30 hover:text-white/60"
                      }`}
                      data-testid={`button-gender-${g.value}`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <CyberButton variant="ghost" className="flex-1" onClick={() => setStep(2)}>BACK</CyberButton>
                <CyberButton
                  className="flex-1"
                  onClick={handleFinish}
                  isLoading={saveMutation.isPending}
                  data-testid="button-initialize"
                >
                  INITIALIZE
                </CyberButton>
              </div>

              {saveMutation.isError && (
                <p className="text-red-500 text-[10px] font-mono mt-3 text-center">
                  System error. Please try again.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Brand footer */}
      <div className="relative z-10 mt-10 text-center">
        <span className="font-brand text-3xl text-white/10 tracking-[0.3em]">KAIOS</span>
      </div>

      <div className="absolute top-8 left-8 p-4 border-l-2 border-t-2 border-primary/20 w-24 h-24 pointer-events-none" />
      <div className="absolute bottom-8 right-8 p-4 border-r-2 border-b-2 border-primary/20 w-24 h-24 pointer-events-none" />
    </div>
  );
}
