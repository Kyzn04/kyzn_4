import { CyberButton } from "@/components/ui/CyberButton";
import { Cpu, Terminal } from "lucide-react";
import { useEffect, useState } from "react";

export default function Landing() {
  const [text, setText] = useState("");
  const fullText = "INITIALIZING SKILL_OS v2.0...";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Grid Animation */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ 
             backgroundImage: "linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)", 
             backgroundSize: "30px 30px",
             transform: "perspective(500px) rotateX(60deg) translateY(-100px) scale(2)"
           }} 
      />

      <div className="relative z-10 max-w-2xl w-full px-4 text-center space-y-12">
        <div className="space-y-6">
          <div className="inline-flex p-4 rounded-full bg-primary/10 border border-primary/50 shadow-[0_0_30px_rgba(0,255,255,0.3)] animate-pulse">
            <Cpu className="w-16 h-16 text-primary" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
            SKILL_OS
          </h1>
          
          <div className="h-6 font-mono text-primary/80 tracking-widest text-sm md:text-base">
            <span className="mr-2">root@system:~#</span>
            {text}
            <span className="animate-pulse">_</span>
          </div>
        </div>

        <div className="p-8 border border-border/50 bg-card/80 backdrop-blur-md rounded-lg max-w-md mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg pointer-events-none" />
          
          <p className="text-muted-foreground mb-8 font-mono text-sm leading-relaxed">
            Gamify your existence. Track stats, unlock skills, and evolve your real-life character profile.
          </p>

          <CyberButton size="lg" className="w-full" onClick={handleLogin}>
            <Terminal className="w-5 h-5 mr-2" />
            CONNECT TO SYSTEM
          </CyberButton>
          
          <div className="mt-6 flex justify-center gap-4 text-[10px] font-mono text-muted-foreground uppercase">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Secure</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Encrypted</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-secondary" /> v2.0.4</span>
          </div>
        </div>
      </div>
      
      {/* Decorative footer elements */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
