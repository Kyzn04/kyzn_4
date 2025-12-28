import { Layout } from "@/components/layout/Layout";
import { CyberCard } from "@/components/ui/CyberCard";
import { CyberButton } from "@/components/ui/CyberButton";
import { useSkills } from "@/hooks/use-skills";
import { useProfile } from "@/hooks/use-profile";
import { Loader2, Lock, Unlock, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SkillTree() {
  const { skills, isLoading: skillsLoading, unlockSkill, isUnlocking } = useSkills();
  const { profile } = useProfile();
  const [selectedSkill, setSelectedSkill] = useState<any>(null);

  if (skillsLoading || !profile) {
    return (
      <Layout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Organize skills by category
  const categories = Array.from(new Set(skills.map(s => s.category)));

  const handleUnlock = (skillId: number) => {
    unlockSkill(skillId, {
      onSuccess: () => {
        setSelectedSkill(null); // Close modal or refresh state
      }
    });
  };

  const SkillNode = ({ skill }: { skill: any }) => {
    const isUnlocked = skill.isUnlocked;
    const canUnlock = !isUnlocked && 
      profile.intelligence >= skill.requiredInt &&
      profile.strength >= skill.requiredStr &&
      profile.charisma >= skill.requiredCha &&
      profile.sense >= skill.requiredSen &&
      profile.agility >= skill.requiredAgi &&
      profile.vitality >= skill.requiredVit;

    return (
      <motion.button
        layoutId={`skill-${skill.id}`}
        onClick={() => setSelectedSkill(skill)}
        className={cn(
          "w-16 h-16 md:w-20 md:h-20 border-2 rounded-lg flex flex-col items-center justify-center relative transition-all duration-300 group",
          isUnlocked 
            ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(0,255,255,0.3)]" 
            : canUnlock 
              ? "bg-background border-accent/50 hover:border-accent hover:shadow-[0_0_15px_rgba(255,255,0,0.2)]" 
              : "bg-muted/20 border-muted-foreground/20 opacity-70 cursor-not-allowed"
        )}
      >
        {isUnlocked ? (
          <Unlock className="w-6 h-6 text-primary mb-1" />
        ) : (
          <Lock className={cn("w-6 h-6 mb-1", canUnlock ? "text-accent" : "text-muted-foreground")} />
        )}
        <span className={cn("text-[0.6rem] md:text-xs font-bold font-mono truncate w-full px-1 text-center", isUnlocked ? "text-primary-foreground" : "text-muted-foreground")}>
          {skill.name}
        </span>
        
        {/* Connection lines would be complex here, simplifying to grid for now */}
        {!isUnlocked && canUnlock && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping" />
        )}
      </motion.button>
    );
  };

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border/50 pb-6">
          <div>
            <h1 className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
              NEURAL NETWORK
            </h1>
            <p className="text-muted-foreground font-mono text-sm max-w-2xl">
              Unlock cognitive and physical enhancements. Requirements must be met to bridge neural connections.
            </p>
          </div>
          <div className="flex gap-2 text-xs font-mono border border-border p-2 rounded bg-card/50">
            <div className="px-2 py-1 bg-primary/20 text-primary rounded">UNLOCKED</div>
            <div className="px-2 py-1 bg-accent/20 text-accent rounded">AVAILABLE</div>
            <div className="px-2 py-1 bg-muted/20 text-muted-foreground rounded">LOCKED</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <CyberCard key={category} title={category.toUpperCase()} className="h-full">
              <div className="flex flex-wrap gap-4 justify-center py-6 relative">
                 {/* Decorative tree lines could go here as absolute positioned SVGs */}
                 
                 {skills
                   .filter(s => s.category === category)
                   .map(skill => (
                     <SkillNode key={skill.id} skill={skill} />
                   ))
                 }
              </div>
            </CyberCard>
          ))}
        </div>
      </div>

      {/* Skill Detail Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <CyberCard variant="neon" className="bg-card shadow-2xl border-primary/30">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-primary">{selectedSkill.name}</h3>
                    <p className="text-xs font-mono text-muted-foreground uppercase">{selectedSkill.category} // {selectedSkill.type}</p>
                  </div>
                  <button onClick={() => setSelectedSkill(null)} className="text-muted-foreground hover:text-white">
                    <Zap className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
                  {selectedSkill.description}
                </p>

                <div className="bg-muted/30 rounded p-4 border border-border mb-6">
                  <h4 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Requirements</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    {selectedSkill.requiredInt > 0 && (
                      <div className={cn("flex justify-between p-1 rounded", profile.intelligence >= selectedSkill.requiredInt ? "bg-primary/20 text-primary" : "bg-destructive/10 text-destructive")}>
                        <span>INT</span> <span>{selectedSkill.requiredInt}</span>
                      </div>
                    )}
                    {selectedSkill.requiredStr > 0 && (
                      <div className={cn("flex justify-between p-1 rounded", profile.strength >= selectedSkill.requiredStr ? "bg-primary/20 text-primary" : "bg-destructive/10 text-destructive")}>
                        <span>STR</span> <span>{selectedSkill.requiredStr}</span>
                      </div>
                    )}
                    {selectedSkill.requiredCha > 0 && (
                      <div className={cn("flex justify-between p-1 rounded", profile.charisma >= selectedSkill.requiredCha ? "bg-primary/20 text-primary" : "bg-destructive/10 text-destructive")}>
                        <span>CHA</span> <span>{selectedSkill.requiredCha}</span>
                      </div>
                    )}
                    {selectedSkill.requiredSen > 0 && (
                      <div className={cn("flex justify-between p-1 rounded", profile.sense >= selectedSkill.requiredSen ? "bg-primary/20 text-primary" : "bg-destructive/10 text-destructive")}>
                        <span>SEN</span> <span>{selectedSkill.requiredSen}</span>
                      </div>
                    )}
                    {selectedSkill.requiredAgi > 0 && (
                      <div className={cn("flex justify-between p-1 rounded", profile.agility >= selectedSkill.requiredAgi ? "bg-primary/20 text-primary" : "bg-destructive/10 text-destructive")}>
                        <span>AGI</span> <span>{selectedSkill.requiredAgi}</span>
                      </div>
                    )}
                    {selectedSkill.requiredVit > 0 && (
                      <div className={cn("flex justify-between p-1 rounded", profile.vitality >= selectedSkill.requiredVit ? "bg-primary/20 text-primary" : "bg-destructive/10 text-destructive")}>
                        <span>VIT</span> <span>{selectedSkill.requiredVit}</span>
                      </div>
                    )}
                    {selectedSkill.requiredInt === 0 && 
                     selectedSkill.requiredStr === 0 &&
                     selectedSkill.requiredCha === 0 &&
                     selectedSkill.requiredSen === 0 &&
                     selectedSkill.requiredAgi === 0 &&
                     selectedSkill.requiredVit === 0 && (
                       <span className="col-span-3 text-center text-muted-foreground">NO REQUIREMENTS</span>
                     )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <CyberButton variant="ghost" className="flex-1" onClick={() => setSelectedSkill(null)}>
                    Cancel
                  </CyberButton>
                  
                  {selectedSkill.isUnlocked ? (
                    <CyberButton disabled className="flex-1 border-primary/50 text-primary/50">
                      Already Acquired
                    </CyberButton>
                  ) : (
                    <CyberButton 
                      variant="primary" 
                      className="flex-1"
                      isLoading={isUnlocking}
                      disabled={
                        profile.intelligence < selectedSkill.requiredInt ||
                        profile.strength < selectedSkill.requiredStr ||
                        profile.charisma < selectedSkill.requiredCha ||
                        profile.sense < selectedSkill.requiredSen ||
                        profile.agility < selectedSkill.requiredAgi ||
                        profile.vitality < selectedSkill.requiredVit
                      }
                      onClick={() => handleUnlock(selectedSkill.id)}
                    >
                      Initialize Upload
                    </CyberButton>
                  )}
                </div>
              </CyberCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
