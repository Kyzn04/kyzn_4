import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const dailyTranscripts = pgTable("daily_transcripts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow().notNull(),
  questSnapshot: jsonb("quest_snapshot").notNull(),
  tasksCompleted: integer("tasks_completed").notNull(),
  isDisciplined: boolean("is_disciplined").default(false).notNull(), // 6/10 completed
});

export const rewardLogs = pgTable("reward_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  rewardType: text("reward_type").notNull(), // "anime", "food", "merit"
  details: text("details"),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  // Core Stats (base foundation, 0-500 scale)
  intelligence: integer("intelligence").default(10).notNull(), // INT
  strength: integer("strength").default(10).notNull(), // STR
  charisma: integer("charisma").default(10).notNull(), // CHA
  sense: integer("sense").default(10).notNull(), // SEN
  agility: integer("agility").default(10).notNull(), // AGI
  vitality: integer("vitality").default(10).notNull(), // VIT
  // Kaizen Stats (0-100 scale)
  kaizenStr: integer("kaizen_str").default(50).notNull(),
  kaizenInt: integer("kaizen_int").default(50).notNull(),
  kaizenSpi: integer("kaizen_spi").default(50).notNull(),
  kaizenVit: integer("kaizen_vit").default(50).notNull(),
  kaizenWis: integer("kaizen_wis").default(50).notNull(),
  kaizenDis: integer("kaizen_dis").default(50).notNull(),
  // HP/MP (Energy and Focus)
  hp: integer("hp").default(100).notNull(),
  mp: integer("mp").default(100).notNull(),
  // Discipline & Rewards
  experience: integer("experience").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  disciplinePoints: integer("discipline_points").default(0).notNull(),
  favorPoints: integer("favor_points").default(0).notNull(),
  disciplineStreak: integer("discipline_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  totalDisciplinedDays: integer("total_disciplined_days").default(0).notNull(),
  rewardClaimedToday: boolean("reward_claimed_today").default(false).notNull(),
  // Quest Progress
  questProgress: jsonb("quest_progress").default({ 
    flow: 0,
    push: 0, 
    sit: 0, 
    squat: 0,
    bible: 0,
    book: 0,
    meals: 0,
    meditation: 0,
    journaling: 0,
    creation: 0
  }).notNull(),
  // Meta
  currentTitle: text("current_title").default("Unawakened").notNull(),
  currentClass: text("current_class").default("Civilian").notNull(),
  bio: text("bio"),
  lastEvolutionCheck: timestamp("last_evolution_check").defaultNow(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., "The Engineering Authority"
  type: text("type").notNull(), // "Active" or "Passive"
  parentSkillId: integer("parent_skill_id"), // For tree structure
  requiredInt: integer("required_int").default(0),
  requiredStr: integer("required_str").default(0),
  requiredCha: integer("required_cha").default(0),
  requiredSen: integer("required_sen").default(0),
  requiredAgi: integer("required_agi").default(0),
  requiredVit: integer("required_vit").default(0),
});

export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  skillId: integer("skill_id").notNull().references(() => skills.id),
  learned: boolean("learned").default(false).notNull(),
  progress: integer("progress").default(0).notNull(), // 0-100
  acquiredAt: timestamp("acquired_at"),
});

// === RELATIONS ===
export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
}));

export const skillsRelations = relations(skills, ({ one, many }) => ({
  parent: one(skills, {
    fields: [skills.parentSkillId],
    references: [skills.id],
    relationName: "skillTree"
  }),
  children: many(skills, {
    relationName: "skillTree"
  })
}));

// === BASE SCHEMAS ===
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, userId: true, lastEvolutionCheck: true });
export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });
export const insertUserSkillSchema = createInsertSchema(userSkills).omit({ id: true, acquiredAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Skill = typeof skills.$inferSelect;
export type UserSkill = typeof userSkills.$inferSelect;

export type CreateProfileRequest = InsertProfile;
export type UpdateProfileRequest = Partial<InsertProfile>;

export type SkillResponse = Skill & {
  children?: SkillResponse[];
  isUnlocked?: boolean;
};

export type UserSkillResponse = UserSkill & {
  skill: Skill;
};
