import { db } from "./db";
import {
  profiles, skills, userSkills,
  type Profile, type InsertProfile, type UpdateProfileRequest,
  type Skill, type UserSkill
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Profile
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile & { userId: string }): Promise<Profile>;
  updateProfile(userId: string, updates: UpdateProfileRequest): Promise<Profile>;
  
  // Skills
  getSkills(): Promise<Skill[]>;
  getUserSkills(userId: string): Promise<UserSkill[]>;
  unlockSkill(userId: string, skillId: number): Promise<UserSkill>;
  
  // Seed
  createSkill(skill: any): Promise<Skill>;
  getSkillByName(name: string): Promise<Skill | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile & { userId: string }): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(userId: string, updates: UpdateProfileRequest): Promise<Profile> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    if (!profile) throw new Error("Profile not found");

    // Evolution Logic
    let evolvedTitle = profile.currentTitle;
    const finalStats = { ...profile, ...updates };
    
    if (finalStats.intelligence > 100) evolvedTitle = "Electrical Engineer";
    else if (finalStats.intelligence > 50 && (finalStats.sense || 0) > 30) evolvedTitle = "Apprentice Technician";
    else if (finalStats.strength > 100 && (finalStats.vitality || 0) > 100) evolvedTitle = "Iron Monarch";
    
    const [updated] = await db.update(profiles)
      .set({ ...updates, currentTitle: evolvedTitle })
      .where(eq(profiles.userId, userId))
      .returning();
    return updated;
  }

  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills);
  }

  async getUserSkills(userId: string): Promise<UserSkill[]> {
    return await db.select().from(userSkills).where(eq(userSkills.userId, userId));
  }

  async unlockSkill(userId: string, skillId: number): Promise<UserSkill> {
    const [unlocked] = await db.insert(userSkills)
      .values({ userId, skillId, learned: true, progress: 100 })
      .returning();
    return unlocked;
  }

  async createSkill(skill: any): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  async getSkillByName(name: string): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.name, name));
    return skill;
  }

  async incrementStat(userId: string, stat: string): Promise<Profile> {
    const profile = await this.getProfile(userId);
    if (!profile) throw new Error("Profile not found");
    
    const statMap: Record<string, keyof Profile> = {
      'str': 'strength',
      'agi': 'agility',
      'int': 'intelligence',
      'vit': 'vitality',
      'sen': 'sense',
      'cha': 'charisma',
    };
    
    const statKey = statMap[stat.toLowerCase()];
    if (!statKey) throw new Error("Invalid stat");
    
    const currentValue = (profile[statKey] as number) || 0;
    if (currentValue >= 500) throw new Error("Stat at cap");
    
    const updated = await this.updateProfile(userId, {
      [statKey]: currentValue + 1
    });
    return updated;
  }

  async updateHpMp(userId: string, hp?: number, mp?: number): Promise<Profile> {
    const updates: any = {};
    if (hp !== undefined) updates.hp = Math.min(100, Math.max(0, hp));
    if (mp !== undefined) updates.mp = Math.min(100, Math.max(0, mp));
    
    const updated = await this.updateProfile(userId, updates);
    return updated;
  }

  async updateQuest(userId: string, quest: string, mode: "increment" | "complete" = "increment"): Promise<Profile> {
    const profile = await this.getProfile(userId);
    if (!profile) throw new Error("Profile not found");
    
    const questMap = { ...(profile.questProgress as Record<string, number>) };
    const questMax: Record<string, number> = {
      flow: 7,
      push: 35,
      sit: 35,
      squat: 30,
      bible: 3,
      book: 5,
      meals: 4
    };
    
    if (!(quest in questMax)) throw new Error("INVALID QUEST TYPE");

    const maxValue = questMax[quest];
    const prevValue = questMap[quest] || 0;
    
    if (mode === "complete") {
      questMap[quest] = maxValue;
    } else {
      questMap[quest] = Math.min(maxValue, prevValue + 1);
    }
    
    const newValue = questMap[quest];
    const updates: UpdateProfileRequest = { questProgress: questMap };

    // Bonus Points Logic
    if (newValue > prevValue) {
      // Favor Points for Biblical/Reading tasks
      if (quest === "bible" || quest === "book") {
        updates.favorPoints = (profile.favorPoints || 0) + (mode === "complete" ? (maxValue - prevValue) * 10 : 10);
      }
      
      // Discipline for Workouts
      if (quest === "push" || quest === "sit" || quest === "squat") {
        updates.disciplinePoints = (profile.disciplinePoints || 0) + (mode === "complete" ? (maxValue - prevValue) : 1);
        updates.kaizenDis = Math.min(100, (profile.kaizenDis || 0) + 1);
      }
    }
    
    const updated = await this.updateProfile(userId, updates);
    return updated;
  }

  async claimRecovery(userId: string): Promise<Profile> {
    const profile = await this.getProfile(userId);
    if (!profile) throw new Error("Profile not found");
    
    const updated = await this.updateProfile(userId, {
      hp: 100,
      mp: 100,
      strength: profile.strength + 2,
      agility: profile.agility + 2,
      intelligence: profile.intelligence + 2,
      vitality: profile.vitality + 2,
      sense: profile.sense + 2,
      charisma: profile.charisma + 2,
      questProgress: { 
        flow: 0,
        push: 0, sit: 0, squat: 0,
        bible: 0, book: 0, meals: 0
      },
      rewardClaimedToday: false
    });
    return updated;
  }

  async claimReward(userId: string, type: string): Promise<Profile> {
    const profile = await this.getProfile(userId);
    if (!profile) throw new Error("Profile not found");
    if (profile.rewardClaimedToday) throw new Error("REWARD ALREADY CLAIMED TODAY");

    const questProgress = profile.questProgress as Record<string, number>;
    const flowCompleted = (questProgress.flow || 0) >= 7;
    const otherTasksCompleted = Object.entries(questProgress)
      .filter(([key, val]) => key !== "flow" && val >= 1).length;
    
    if (!flowCompleted || otherTasksCompleted < 3) throw new Error("INSUFFICIENT MERIT: SYSTEM REQUIRES 7/7 FLOW + 3 OBJECTIVES");

    const updates: UpdateProfileRequest = {
      rewardClaimedToday: true
    };

    if (type === "merit") {
      updates.disciplinePoints = profile.disciplinePoints + 10;
      updates.disciplineStreak = profile.disciplineStreak + 1;
      updates.totalDisciplinedDays = profile.totalDisciplinedDays + 1;
      if (updates.disciplineStreak > profile.longestStreak) {
        updates.longestStreak = updates.disciplineStreak;
      }
    }

    return await this.updateProfile(userId, updates);
  }
}

export const storage = new DatabaseStorage();
