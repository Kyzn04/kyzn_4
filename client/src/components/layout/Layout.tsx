import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { 
  LayoutDashboard, 
  Network, 
  User, 
  LogOut, 
  Menu,
  X,
  Trophy,
  Flame,
  ShoppingCart,
  BarChart2
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const { profile } = useProfile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/status", label: "Player Status", icon: BarChart2 },
    { href: "/skills", label: "Skill Tree", icon: Network },
    { href: "/discipline", label: "Discipline", icon: Flame },
    { href: "/streak", label: "Streak", icon: Trophy },
    { href: "/rewards", label: "Rewards", icon: Trophy },
    { href: "/shop", label: "Shop", icon: ShoppingCart },
    { href: "/profile", label: "Identity", icon: User },
  ];

  const displayName = profile?.displayName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "OPERATOR");
  const username = profile?.username;
  const avatarUrl = profile?.avatarUrl;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="font-brand font-bold text-xl tracking-widest text-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">KAIOS</span>
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
        {/* Brand */}
        <div className="p-6 hidden md:flex items-center gap-3 border-b border-border/30">
          <h1 className="font-brand font-bold text-3xl tracking-widest text-primary drop-shadow-[0_0_12px_rgba(0,229,255,0.6)] text-glow">
            KAIOS
          </h1>
        </div>

        {/* User Identity Card */}
        <div className="px-4 py-4 border-b border-border/20">
          <div className="bg-muted/20 p-3 border border-border/40 rounded flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded bg-background object-cover border border-primary/50 shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary font-brand font-bold shrink-0">
                {displayName?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden min-w-0">
              <p className="font-display text-sm truncate text-foreground font-bold tracking-wide">{displayName}</p>
              {username && (
                <p className="text-[10px] font-mono text-primary/60 truncate">@{username}</p>
              )}
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <p className="text-[9px] font-mono text-green-400/70 uppercase tracking-widest">Online</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded border border-transparent transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 border-primary/50 text-primary shadow-[0_0_10px_rgba(0,255,255,0.15)]"
                  : "hover:bg-muted hover:text-primary hover:border-primary/20"
              )} onClick={() => setIsMobileOpen(false)}>
                <item.icon className={cn("w-4 h-4 shrink-0", isActive && "text-glow")} />
                <span className="font-display tracking-wide text-xs font-bold">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_5px_currentColor]" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          {profile && (
            <div className="mb-3 px-4 py-2 border border-border/20 rounded">
              <div className="text-[8px] font-mono text-muted-foreground/50 uppercase tracking-widest">Current Title</div>
              <div className="text-[11px] font-display text-primary/80 font-bold truncate">{profile.currentTitle}</div>
            </div>
          )}
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-4 py-3 text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-display font-bold text-xs tracking-wide uppercase">Disconnect</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
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
