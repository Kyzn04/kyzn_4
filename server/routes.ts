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

  // Helper: Evolution Logic
  function calculateEvolution(profile: any) {
    let title = profile.currentTitle;
    let cls = profile.currentClass;

    const { intelligence: int, strength: str, charisma: cha, sense: sen, agility: agi, vitality: vit } = profile;

    // Engineering Authority (INT + SEN)
    if (int > 20) title = "Novice Tinkerer";
    if (int > 50) title = "Apprentice Technician";
    if (int > 100 && sen > 80) title = "Electrical Engineer";
    if (int > 300) title = "Systems Architect";
    if (int > 500) title = "Iron Monarch"; // Hypothetical top tier

    // Simple logic for class detection based on highest stats
    if (int > 20 && sen > 20) cls = "Engineering Authority";
    // Add more logic for other classes based on the user's text file rules if needed
    // For now, let's keep it simple as per the snippet provided.

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

    try {
      const updated = await storage.updateQuest(userId, quest);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
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
