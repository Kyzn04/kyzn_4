import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Loader2 } from "lucide-react";

import Dashboard from "@/pages/Dashboard";
import SkillTree from "@/pages/SkillTree";
import ProfilePage from "@/pages/Profile";
import RewardsPage from "@/pages/Rewards";
import ShopPage from "@/pages/Shop";
import DisciplinePage from "@/pages/Discipline";
import DisciplineStreakPage from "@/pages/DisciplineStreak";
import PlayerStatus from "@/pages/PlayerStatus";
import Onboarding from "@/pages/Onboarding";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-mono text-xs animate-pulse tracking-widest uppercase">Initializing KAIOS...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { user, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();

  if (authLoading || (user && profileLoading)) return <LoadingScreen />;
  if (!user) return <Redirect to="/welcome" />;

  // Redirect to onboarding if not yet completed
  if (profile && !profile.onboardingComplete) {
    return <Redirect to="/onboarding" />;
  }

  return <Component />;
}

function OnboardingRoute() {
  const { user, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();

  if (authLoading || (user && profileLoading)) return <LoadingScreen />;
  if (!user) return <Redirect to="/welcome" />;
  // If onboarding is complete, send to dashboard
  if (profile?.onboardingComplete) return <Redirect to="/" />;
  return <Onboarding />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  return (
    <Switch>
      <Route path="/welcome">
        {user ? <Redirect to="/" /> : <Landing />}
      </Route>

      <Route path="/onboarding">
        {() => <OnboardingRoute />}
      </Route>

      <Route path="/">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>

      <Route path="/skills">
        {() => <ProtectedRoute component={SkillTree} />}
      </Route>

      <Route path="/profile">
        {() => <ProtectedRoute component={ProfilePage} />}
      </Route>

      <Route path="/rewards">
        {() => <ProtectedRoute component={RewardsPage} />}
      </Route>

      <Route path="/shop">
        {() => <ProtectedRoute component={ShopPage} />}
      </Route>

      <Route path="/discipline">
        {() => <ProtectedRoute component={DisciplinePage} />}
      </Route>

      <Route path="/streak">
        {() => <ProtectedRoute component={DisciplineStreakPage} />}
      </Route>

      <Route path="/status">
        {() => <ProtectedRoute component={PlayerStatus} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
