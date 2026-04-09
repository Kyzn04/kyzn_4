import { CyberButton } from "@/components/ui/CyberButton";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Zap } from "lucide-react";

export default function Landing() {
  const [phase, setPhase] = useState<"boot" | "ready" | "activating" | "access">("boot");
  const [messages, setMessages] = useState<string[]>([]);
  const { user } = useAuth();

  const systemLogs = [
    "KAIOS CORE v2.0 INITIALIZING...",
    "NEURAL SYNC PROTOCOLS ACTIVE...",
    "DISCIPLINE ENGINE ONLINE...",
    "BIOMETRIC ARCHIVE SCAN COMPLETE...",
    "IDENTITY MATRIX SYNCHRONIZED...",
    "KAIOS SYSTEM ACCESSIBLE."
  ];

  useEffect(() => {
    const t = setTimeout(() => setPhase("ready"), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === "activating") {
      let i = 0;
      const interval = setInterval(() => {
        if (i < systemLogs.length) {
          setMessages(prev => [...prev, systemLogs[i]]);
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => setPhase("access"), 800);
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleActivate = () => setPhase("activating");
  const handleEnter = () => { window.location.href = "/api/login"; };

  if (user) {
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center space-y-10"
        >
          <div className="space-y-2">
            <h1 className="font-brand text-7xl tracking-[0.2em] text-white drop-shadow-[0_0_30px_rgba(0,229,255,0.4)]">
              KAIOS
            </h1>
            <p className="text-primary/60 font-mono tracking-[0.5em] text-xs uppercase">System Status: Active</p>
          </div>
          <div className="p-1 border border-primary/20 bg-primary/5 inline-block">
            <div className="px-6 py-3 font-mono text-sm text-white/60 uppercase tracking-widest">
              Welcome back, <span className="text-primary font-bold">{user.firstName}</span>
            </div>
          </div>
          <CyberButton size="lg" variant="primary" onClick={() => window.location.href = "/"} className="w-64 h-14 text-base">
            RESUME PROTOCOL
          </CyberButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(0,229,255,0.08)_0%,transparent_60%)]" />

      <AnimatePresence mode="wait">
        {phase === "boot" && (
          <motion.div key="boot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative z-10 text-center">
            <div className="font-brand text-2xl text-primary/30 tracking-[0.5em] animate-pulse">BOOTING...</div>
          </motion.div>
        )}

        {phase === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center space-y-16"
          >
            {/* Logo block */}
            <div className="space-y-6">
              {/* Animated corner rings */}
              <div className="relative inline-flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute w-56 h-56 border border-primary/10 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute w-40 h-40 border border-primary/20 rounded-full"
                />
                <div className="relative z-10 w-28 h-28 border-2 border-primary bg-black/80 flex items-center justify-center shadow-[0_0_60px_rgba(0,229,255,0.35)]">
                  <Zap className="w-14 h-14 text-primary" />
                </div>
              </div>

              {/* Brand name */}
              <div>
                <h1 className="font-brand text-8xl md:text-9xl tracking-[0.15em] text-white drop-shadow-[0_0_40px_rgba(0,229,255,0.5)] leading-none">
                  KAIOS
                </h1>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <div className="h-px flex-1 max-w-16 bg-primary/30" />
                  <p className="text-primary/60 font-mono tracking-[0.6em] text-xs uppercase">Life Operating System</p>
                  <div className="h-px flex-1 max-w-16 bg-primary/30" />
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-4">
              <CyberButton size="lg" variant="primary" onClick={handleActivate}
                className="w-72 h-14 text-base shadow-[0_0_30px_rgba(0,229,255,0.2)] hover:shadow-[0_0_50px_rgba(0,229,255,0.4)]">
                ACTIVATE SYSTEM
              </CyberButton>
              <p className="text-white/20 font-mono text-[10px] uppercase tracking-widest">
                New operators will be registered automatically
              </p>
            </div>
          </motion.div>
        )}

        {phase === "activating" && (
          <motion.div
            key="activating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 w-full max-w-sm p-8 border border-primary/20 bg-black/50 backdrop-blur-md"
          >
            <div className="mb-4 text-[9px] font-mono text-primary/40 uppercase tracking-widest">
              System Boot Sequence
            </div>
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="text-primary font-mono text-xs flex items-center gap-3"
                >
                  <div className="w-1 h-3 bg-primary shrink-0 animate-pulse" />
                  {msg}
                </motion.div>
              ))}
              {messages.length < systemLogs.length && (
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 bg-primary/40 animate-pulse" />
                  <div className="h-1 w-24 bg-primary/20 animate-pulse rounded-full" />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {phase === "access" && (
          <motion.div
            key="access"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 text-center space-y-10"
          >
            <div className="space-y-2">
              <div className="text-primary text-sm tracking-[1em] font-mono font-black animate-pulse border border-primary/30 bg-primary/5 py-4 px-10 inline-block">
                SYSTEM READY
              </div>
            </div>
            <div className="space-y-4">
              <CyberButton size="lg" variant="primary" onClick={handleEnter}
                className="w-72 h-16 text-lg">
                ENTER KAIOS
              </CyberButton>
              <p className="text-white/20 font-mono text-[10px] uppercase tracking-widest">
                Authentication via Replit Identity
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 border-primary/25 pointer-events-none" />
      <div className="absolute top-8 right-8 w-20 h-20 border-r-2 border-t-2 border-primary/25 pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-20 h-20 border-l-2 border-b-2 border-primary/25 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 border-primary/25 pointer-events-none" />

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[8px] text-primary/20 font-mono uppercase tracking-[0.5em]">
        <span>KAIOS v2.0</span>
        <span className="w-1 h-1 bg-primary/30 rounded-full" />
        <span>Life Operating System</span>
      </div>
    </div>
  );
}
