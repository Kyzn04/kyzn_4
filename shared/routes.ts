import { z } from 'zod';
import { insertProfileSchema, profiles, skills, userSkills } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  profile: {
    get: {
      method: 'GET' as const,
      path: '/api/profile',
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/profile',
      input: insertProfileSchema.partial(),
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    incrementStat: {
      method: 'POST' as const,
      path: '/api/profile/stat/:stat',
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateHpMp: {
      method: 'PATCH' as const,
      path: '/api/profile/hpmp',
      input: z.object({ hp: z.number().optional(), mp: z.number().optional() }),
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
      },
    },
    updateQuest: {
      method: 'PATCH' as const,
      path: '/api/profile/quest/:quest',
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
      },
    },
    claimRecovery: {
      method: 'POST' as const,
      path: '/api/profile/claim-recovery',
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
      },
    },
  },
  skills: {
    list: {
      method: 'GET' as const,
      path: '/api/skills',
      responses: {
        200: z.array(z.custom<typeof skills.$inferSelect & { children?: any[], isUnlocked?: boolean }>()),
      },
    },
    unlock: {
      method: 'POST' as const,
      path: '/api/skills/:id/unlock',
      responses: {
        200: z.custom<typeof userSkills.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ProfileResponse = z.infer<typeof api.profile.get.responses[200]>;
export type UpdateProfileInput = z.infer<typeof api.profile.update.input>;
export type SkillListResponse = z.infer<typeof api.skills.list.responses[200]>;
