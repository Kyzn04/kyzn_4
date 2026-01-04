import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Dashboard from "@/pages/Dashboard";
import SkillTree from "@/pages/SkillTree";
import ProfilePage from "@/pages/Profile";
import RewardsPage from "@/pages/Rewards";
import DisciplinePage from "@/pages/Discipline";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/welcome" />;
  }

  return <Component {...rest} />;
}

function Router() {
  const { user, isLoading } = useAuth();

  // Handle initial redirect based on auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/welcome">
        {user ? <Redirect to="/" /> : <Landing />}
      </Route>
      
      <Route path="/">
        {user ? <Dashboard /> : <Redirect to="/welcome" />}
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

      <Route path="/discipline">
        {() => <ProtectedRoute component={DisciplinePage} />}
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
