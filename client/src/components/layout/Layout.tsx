import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Network, 
  User, 
  LogOut, 
  Cpu, 
  Menu,
  X,
  Trophy,
  Flame
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/skills", label: "Skill Tree", icon: Network },
    { href: "/discipline", label: "Discipline", icon: Flame },
    { href: "/streak", label: "Streak", icon: Trophy },
    { href: "/rewards", label: "Rewards", icon: Trophy },
    { href: "/profile", label: "Identity", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Cpu className="text-primary w-8 h-8" />
          <span className="font-display font-bold text-lg tracking-widest text-glow">KYZN</span>
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 text-primary">
          {isMobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed md:sticky md:top-0 h-screen w-64 bg-card/90 md:bg-card border-r border-border/50 flex flex-col transition-transform duration-300 z-40 backdrop-blur-xl md:backdrop-blur-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-8 hidden md:flex items-center gap-3">
          <Cpu className="text-primary w-8 h-8 animate-pulse" />
          <h1 className="font-display font-bold text-2xl tracking-widest text-glow">KYZN</h1>
        </div>

        <div className="px-4 py-2 mb-6">
          <div className="bg-muted/30 p-3 border border-border rounded flex items-center gap-3">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="Avatar" className="w-10 h-10 rounded bg-background object-cover border border-primary/50" />
            ) : (
              <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user?.firstName?.[0]}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="font-display text-sm truncate text-foreground font-bold">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs font-mono text-primary/70 truncate">ONLINE</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded border border-transparent transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 border-primary/50 text-primary shadow-[0_0_10px_rgba(0,255,255,0.15)]" 
                  : "hover:bg-muted hover:text-primary hover:border-primary/20"
              )} onClick={() => setIsMobileOpen(false)}>
                <item.icon className={cn("w-5 h-5", isActive && "text-glow")} />
                <span className="font-display tracking-wide text-sm font-bold">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_5px_currentColor]" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <button 
            onClick={() => logout()} 
            className="flex items-center gap-3 w-full px-4 py-3 text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-display font-bold text-sm tracking-wide">DISCONNECT</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        {/* Background Grid */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-20" 
             style={{ 
               backgroundImage: "radial-gradient(circle at center, var(--primary) 1px, transparent 1px)", 
               backgroundSize: "40px 40px" 
             }} 
        />
        
        <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}
