import { CyberButton } from "@/components/ui/CyberButton";
import { ShieldCheck, UserPlus, LogIn, Mail, User, Cpu, Network, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const authSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
});

type AuthValues = z.infer<typeof authSchema>;

export default function Landing() {
  const [phase, setPhase] = useState<"initial" | "auth" | "activating" | "access">("initial");
  const [messages, setMessages] = useState<string[]>([]);
  const { user } = useAuth();
  
  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { username: "", email: "" },
  });

  const systemLogs = [
    "K.A.I.Z.E.N. CORE INITIALIZING...",
    "NEURAL SYNC ESTABLISHED...",
    "DISCIPLINE ENGINE ONLINE...",
    "BIOMETRIC ARCHIVE SCAN COMPLETE...",
    "K.A.I.Z.E.N. SYSTEM ACCESSIBLE."
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

  const handleAuth = async () => {
    setPhase("activating");
  };

  const finalizeLogin = () => {
    window.location.href = "/api/login";
  };

  if (user) {
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center relative overflow-hidden font-mono">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center space-y-12"
        >
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-700" />
            <div className="relative p-12 rounded-full border-2 border-primary/50 bg-black/40 shadow-[0_0_60px_rgba(0,229,255,0.3)]">
              <Cpu className="w-24 h-24 text-primary animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-display font-black tracking-[0.3em] text-white">WELCOME, {user.firstName?.toUpperCase()}</h1>
            <p className="text-primary/60 tracking-[0.5em] text-xs">SYSTEM STATUS: READY</p>
          </div>

          <CyberButton size="lg" variant="primary" onClick={() => window.location.href = "/"} className="w-72 h-14 text-lg">
            RESUME PROTOCOL
          </CyberButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center relative overflow-hidden font-mono">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.1)_0%,transparent_70%)]" />
      
      <AnimatePresence mode="wait">
        {phase === "initial" && (
          <motion.div 
            key="initial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="relative z-10 text-center space-y-12"
          >
            <div className="relative inline-block group">
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 border border-primary/10 rounded-full"
              />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border-2 border-primary/30 rounded-full"
              />
              <div className="relative p-12 rounded-full border-2 border-primary bg-black shadow-[0_0_80px_rgba(0,229,255,0.4)] transition-all duration-500 group-hover:shadow-[0_0_100px_rgba(0,229,255,0.6)]">
                <Network className="w-28 h-28 text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Zap className="text-white w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-display font-black tracking-[0.25em] text-white drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]">
                K.A.I.Z.E.N.
              </h1>
              <p className="text-primary/70 font-mono tracking-[0.8em] text-sm md:text-base uppercase ml-4">System Protocol v1.0</p>
            </div>

            <div className="pt-8">
              <CyberButton size="lg" variant="primary" onClick={() => setPhase("auth")} className="w-80 h-14 text-lg border-primary/50 hover:shadow-[0_0_40px_rgba(0,229,255,0.3)]">
                ACTIVATE CORE
              </CyberButton>
            </div>
          </motion.div>
        )}

        {phase === "auth" && (
          <motion.div 
            key="auth"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 w-full max-w-lg p-12 border border-primary/30 bg-black/90 backdrop-blur-3xl rounded-none shadow-[0_0_50px_rgba(0,229,255,0.15)]"
          >
            <div className="mb-8 border-b border-primary/20 pb-4">
              <h2 className="text-3xl font-display font-bold text-white tracking-[0.2em] uppercase">Identity Verification</h2>
              <p className="text-primary/60 text-[10px] mt-2 font-mono tracking-widest uppercase">Input biometric data credentials</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAuth)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                        <User size={12} className="text-primary" /> Callsign
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ALPHA-01" className="bg-black border-primary/30 focus:border-primary text-primary font-mono h-14 rounded-none tracking-widest" />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                        <Mail size={12} className="text-primary" /> Uplink Address
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="USER@KAIZEN.SYS" className="bg-black border-primary/30 focus:border-primary text-primary font-mono h-14 rounded-none tracking-widest" />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <div className="pt-4 space-y-4">
                  <CyberButton type="submit" size="lg" className="w-full h-14 text-base">
                    INITIALIZE NEURAL LINK
                  </CyberButton>
                  <button type="button" onClick={finalizeLogin} className="w-full text-[10px] text-muted-foreground hover:text-primary transition-all uppercase tracking-[0.3em] py-2">
                    Already Synced? Access Interface
                  </button>
                </div>
              </form>
            </Form>
          </motion.div>
        )}

        {phase === "activating" && (
          <motion.div 
            key="activating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 w-full max-w-md p-10 border border-primary/20 bg-black/40 backdrop-blur-md"
          >
            <div className="space-y-6">
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-primary font-mono text-xs flex items-center gap-3"
                >
                  <div className="w-1 h-3 bg-primary animate-pulse" />
                  {msg}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "access" && (
          <motion.div 
            key="access"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 text-center space-y-8"
          >
            <div className="text-primary text-2xl tracking-[0.8em] font-black animate-pulse bg-primary/10 py-4 px-8 border border-primary/30 inline-block">
              GATE OPEN
            </div>
            <div>
              <CyberButton size="lg" variant="primary" onClick={finalizeLogin} className="w-80 h-16 text-xl border-white text-white hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]">
                ENTER SYSTEM
              </CyberButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-8 left-8 p-4 border-l-2 border-t-2 border-primary/30 w-32 h-32 pointer-events-none" />
      <div className="absolute bottom-8 right-8 p-4 border-r-2 border-b-2 border-primary/30 w-32 h-32 pointer-events-none" />
      
      <div className="fixed bottom-4 left-4 text-[8px] text-primary/30 font-mono uppercase tracking-[0.5em]">System OS 1.0.4.5</div>
      <div className="fixed bottom-4 right-4 text-[8px] text-primary/30 font-mono uppercase tracking-[0.5em]">Kaizen Protocol Active</div>
    </div>
  );
}
