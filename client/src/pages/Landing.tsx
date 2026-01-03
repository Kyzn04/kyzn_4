import { CyberButton } from "@/components/ui/CyberButton";
import { Terminal, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Landing() {
  const [phase, setPhase] = useState<"initial" | "activating" | "access">("initial");
  const [messages, setMessages] = useState<string[]>([]);
  
  const systemLogs = [
    "SYSTEM ONLINE...",
    "USER IDENTIFIED...",
    "SCANNING BIOMETRIC DATA...",
    "PREPARING K.A.I.Z.E.N INTERFACE...",
    "ACCESS GRANTED."
  ];

  useEffect(() => {
    if (phase === "activating") {
      let i = 0;
      const interval = setInterval(() => {
        if (i < systemLogs.length) {
          setMessages(prev => [...prev, systemLogs[i]]);
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => setPhase("access"), 1000);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleLogin = () => {
    setPhase("activating");
  };

  const finalizeLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden font-mono">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.05)_0%,transparent_70%)]" />
      
      <AnimatePresence mode="wait">
        {phase === "initial" && (
          <motion.div 
            key="initial"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="relative z-10 text-center space-y-8"
          >
            <div className="relative inline-block">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-primary/20 rounded-full"
              />
              <div className="p-8 rounded-full border border-primary/50 bg-primary/5 shadow-[0_0_50px_rgba(0,229,255,0.2)]">
                <ShieldCheck className="w-20 h-20 text-primary" />
              </div>
            </div>

            <h1 className="text-7xl font-display font-black tracking-[0.2em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              KYZN
            </h1>

            <CyberButton size="lg" variant="primary" onClick={handleLogin} className="w-64">
              ACTIVATE SYSTEM
            </CyberButton>
          </motion.div>
        )}

        {phase === "activating" && (
          <motion.div 
            key="activating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 w-full max-w-md p-6 border border-primary/30 bg-black/80 backdrop-blur-md"
          >
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-primary text-sm flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                  {msg}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "access" && (
          <motion.div 
            key="access"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 text-center"
          >
            <div className="text-primary text-xl tracking-[0.5em] mb-8 animate-pulse">SYSTEM READY</div>
            <CyberButton size="lg" variant="primary" onClick={finalizeLogin} className="w-64 border-white text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              ENTER GATE
            </CyberButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Overlays */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-20" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-20" />
    </div>
  );
}
