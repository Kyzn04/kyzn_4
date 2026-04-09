import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { profiles } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Helper: Rank from stat value
  function getStatRank(value: number): string {
    if (value >= 121) return "S";
    if (value >= 81)  return "A";
    if (value >= 56)  return "B";
    if (value >= 26)  return "C";
    if (value >= 11)  return "D";
    return "E";
  }

  // Helper: Evolution Logic — title/class based on dominant stat + rank
  function calculateEvolution(profile: any) {
    const { intelligence: int, strength: str, charisma: cha, sense: sen, agility: agi, vitality: vit } = profile;

    const statMap: Record<string, { value: number; category: string; titles: Record<string, string> }> = {
      int: {
        value: int,
        category: "Engineering Authority",
        titles: { E: "Novice Tinkerer", D: "Apprentice Technician", C: "Field Engineer", B: "Systems Specialist", A: "Lead Engineer", S: "Engineering Polymath" },
      },
      str: {
        value: str,
        category: "Apex Predator",
        titles: { E: "Untested Brawler", D: "Iron Trainee", C: "Physical Operator", B: "Combat Veteran", A: "Apex Fighter", S: "Iron Monarch" },
      },
      cha: {
        value: cha,
        category: "Sovereign Leader",
        titles: { E: "Silent Observer", D: "Emerging Voice", C: "Social Tactician", B: "Influential Leader", A: "Sovereign Commander", S: "Legendary Sovereign" },
      },
      sen: {
        value: sen,
        category: "Creative Architect",
        titles: { E: "Raw Observer", D: "Pattern Finder", C: "Design Apprentice", B: "Creative Operator", A: "Master Architect", S: "Visionary Creator" },
      },
      agi: {
        value: agi,
        category: "Tactical Phantom",
        titles: { E: "Slow Starter", D: "Quick Learner", C: "Swift Operator", B: "Tactical Ghost", A: "Phantom Runner", S: "Void Dasher" },
      },
      vit: {
        value: vit,
        category: "Undying Fortress",
        titles: { E: "Fragile Frame", D: "Hardened Shell", C: "Resilient Core", B: "Living Fortress", A: "Immortal Wall", S: "Undying Titan" },
      },
    };

    // Find dominant stat (highest value)
    const dominant = Object.values(statMap).reduce((best, s) => s.value > best.value ? s : best, Object.values(statMap)[0]);
    const rank = getStatRank(dominant.value);

    const title = dominant.titles[rank] || "Unawakened";
    const cls = dominant.category;

    return { title, cls };
  }

  // API Routes
  app.get(api.profile.get.path, async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const userId = req.user.claims.sub;
    
    let profile = await storage.getProfile(userId);
    if (!profile) {
      // Create default profile
      profile = await storage.createProfile({
        userId,
        intelligence: 10, strength: 10, charisma: 10,
        sense: 10, agility: 10, vitality: 10,
        kaizenStr: 50, kaizenInt: 50, kaizenSpi: 50,
        kaizenVit: 50, kaizenWis: 50, kaizenDis: 50,
        hp: 100, mp: 100,
        questProgress: { push: 0, sit: 0, squat: 0, run: 0 },
        currentTitle: "Unawakened",
        currentClass: "Civilian",
        bio: "Ready to evolve.",
      });
    }
    res.json(profile);
  });

  app.patch(api.profile.update.path, async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const userId = req.user.claims.sub;
    
    try {
      const input = api.profile.update.input.parse(req.body);
      const currentProfile = await storage.getProfile(userId);
      if (!currentProfile) return res.status(404).send();

      // Merge stats for evolution check
      const merged = { ...currentProfile, ...input } as any;
      const evolution = calculateEvolution(merged);

      const updated = await storage.updateProfile(userId, {
        ...input,
        currentTitle: evolution.title,
        currentClass: evolution.cls,
      } as any);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.skills.list.path, async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const userId = req.user.claims.sub;
    
    const allSkills = await storage.getSkills();
    const userSkills = await storage.getUserSkills(userId);
    const userSkillIds = new Set(userSkills.map(s => s.skillId));

    // Transform to include 'isUnlocked'
    const skillsWithUnlock = allSkills.map(s => ({
      ...s,
      isUnlocked: userSkillIds.has(s.id)
    }));
    
    res.json(skillsWithUnlock);
  });

  app.post(api.skills.unlock.path, async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const userId = req.user.claims.sub;
    const skillId = parseInt(req.params.id);

    // Verify requirements (simplified for MVP - just check if profile exists)
    const profile = await storage.getProfile(userId);
    if (!profile) return res.status(400).json({ message: "No profile found" });

    // In a real app, check stat requirements here
    const unlocked = await storage.unlockSkill(userId, skillId);
    res.json(unlocked);
  });

  // LOS Endpoints
  app.post(api.profile.incrementStat.path, async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const userId = req.user.claims.sub;
    const stat = req.params.stat;

    try {
      const updated = await storage.incrementStat(userId, stat);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch(api.profile.updateHpMp.path, async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const userId = req.user.claims.sub;

    try {
      const { hp, mp } = api.profile.updateHpMp.input.parse(req.body);
      const updated = await storage.updateHpMp(userId, hp, mp);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch(api.profile.updateQuest.path, async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const userId = req.user.claims.sub;
    const quest = req.params.quest;
    const mode = req.query.mode as "increment" | "complete" || "increment";

    try {
      const updated = await storage.updateQuest(userId, quest, mode);
      
      // Auto-redirect logic check (optional: could also be handled on frontend)
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post("/api/profile/claim-reward", async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const userId = req.user.claims.sub;
    const { type, details } = req.body;

    try {
      const updated = await storage.claimReward(userId, type, details);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post("/api/shop/buy", async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const userId = req.user.claims.sub;
    const { itemId } = req.body;
    try {
      const profile = await storage.getProfile(userId);
      if (!profile) return res.status(404).json({ message: "Profile not found" });

      const items: Record<string, number> = {
        focus_surge: 2,
        streak_seal: 3,
        flow_anchor: 4,
        temporal_grace: 5
      };

      const cost = items[itemId];
      if (!cost) return res.status(400).json({ message: "Invalid item" });
      if ((profile.zCoins || 0) < cost) return res.status(400).json({ message: "Insufficient Z-Coins" });

      const updated = await storage.updateProfile(userId, {
        zCoins: (profile.zCoins || 0) - cost
      });

      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.post("/api/profile/reset-quests", async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const userId = req.user.claims.sub;

    try {
      const profile = await storage.getProfile(userId);
      if (!profile) return res.status(404).json({ message: "Profile not found" });

      // Save transcript before resetting
      const { db } = await import("./db");
      const { dailyTranscripts } = await import("@shared/schema");
      const questProgress = profile.questProgress as Record<string, number>;
      const completedTasks = Object.values(questProgress).filter(v => typeof v === 'number' && v >= 1).length;
      const isDisciplined = completedTasks >= 6;

      await db.insert(dailyTranscripts).values({
        userId,
        date: new Date(),
        questSnapshot: questProgress,
        tasksCompleted: completedTasks,
        isDisciplined,
      });

      // Update streaks based on today's performance
      const streakUpdate: any = {};
      if (isDisciplined) {
        const newStreak = (profile.disciplineStreak || 0) + 1;
        streakUpdate.disciplineStreak = newStreak;
        streakUpdate.totalDisciplinedDays = (profile.totalDisciplinedDays || 0) + 1;
        streakUpdate.longestStreak = Math.max(profile.longestStreak || 0, newStreak);
      } else {
        streakUpdate.disciplineStreak = 0;
      }

      // Reset quests
      const updated = await storage.updateProfile(userId, {
        ...streakUpdate,
        rewardClaimedToday: false,
        questProgress: {
          flow: 0, push: 0, sit: 0, squat: 0,
          bible: 0, book: 0, meals: 0,
          meditation: 0, journaling: 0, creation: 0
        }
      });

      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.get("/api/profile/transcripts", async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const userId = req.user.claims.sub;
    const transcripts = await storage.getDailyTranscripts(userId);
    res.json(transcripts);
  });

  app.post(api.profile.claimRecovery.path, async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const userId = req.user.claims.sub;

    try {
      const updated = await storage.claimRecovery(userId);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // Seed Data
  await seedSkills();

  return httpServer;
}

async function seedSkills() {
  const existing = await storage.getSkills();
  if (existing.length > 0) return;

  const skillsToSeed = [
    // Engineering Authority
    { name: "Circuit Analysis", category: "The Engineering Authority", type: "Passive", description: "KVL/KCL mastery, Nodal analysis.", requiredInt: 20 },
    { name: "Electronics", category: "The Engineering Authority", type: "Active", description: "Soldering, PCB Design, Multimeter usage.", requiredInt: 30 },
    { name: "Power Systems", category: "The Engineering Authority", type: "Passive", description: "Load calculation, Battery chemistry.", requiredInt: 40 },
    { name: "Calculus", category: "The Engineering Authority", type: "Passive", description: "Derivatives, Integrals.", requiredInt: 50 },
    
    // Sovereign Leader
    { name: "Public Speaking", category: "The Sovereign Leader", type: "Active", description: "Pitching ideas, Voice projection.", requiredCha: 20 },
    { name: "Project Management", category: "The Sovereign Leader", type: "Active", description: "Gantt charts, Agile workflows.", requiredCha: 30 },
    
    // Creative Architect
    { name: "Graphic Design", category: "The Creative Architect", type: "Active", description: "Typography, Color Theory.", requiredSen: 20 },
    { name: "UI/UX", category: "The Creative Architect", type: "Active", description: "Wireframing, User empathy mapping.", requiredSen: 30 },
    
    // Apex Predator
    { name: "Calisthenics", category: "The Apex Predator", type: "Active", description: "Push-ups, Pull-ups.", requiredStr: 20, requiredVit: 20 },
    { name: "Stoicism", category: "The Apex Predator", type: "Passive", description: "Emotional regulation, Journaling.", requiredVit: 30 },
  ];

  for (const s of skillsToSeed) {
    await storage.createSkill(s);
  }
}
