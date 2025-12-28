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
}

export const storage = new DatabaseStorage();
