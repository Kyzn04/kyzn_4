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
    const [updated] = await db.update(profiles)
      .set(updates)
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
    
    const currentValue = profile[statKey] as number;
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

  async updateQuest(userId: string, quest: string): Promise<Profile> {
    const profile = await this.getProfile(userId);
    if (!profile) throw new Error("Profile not found");
    
    const questMap: any = profile.questProgress as Record<string, number>;
    const maxValue = quest === 'run' ? 10 : 100;
    questMap[quest] = Math.min(maxValue, (questMap[quest] || 0) + 10);
    
    const updated = await this.updateProfile(userId, { questProgress: questMap });
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
      questProgress: { push: 0, sit: 0, squat: 0, run: 0 }
    });
    return updated;
  }
}

export const storage = new DatabaseStorage();
