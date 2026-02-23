import { z } from "zod";
import { GenreGroups } from "~~/shared/types/campaign";

const allGenres = Object.values(GenreGroups).flat();

const genreSchema = z.enum(allGenres);

const characterItemSchema = z.object({
  name: z.string(),
  concealed: z.boolean(),
});

const characterIdentitySchema = z.object({
  name: z.string(),
  pronouns: z.string().optional(),
  concept: z.string().optional(),
  weapon: characterItemSchema.optional(),
  instrument: characterItemSchema.optional(),
});

const characterSkillSchema = z.object({
  name: z.string(),
  description: z.string(),
  uses: z
    .object({
      usesLeft: z.number(),
      maxUses: z.number(),
    })
    .optional(),
});

const statModifierSchema = z.union([
  z.literal(-2),
  z.literal(-1),
  z.literal(0),
  z.literal(1),
  z.literal(2),
]);

const characterSheetSchema = z.object({
  archetype: z.enum(["king", "queen", "jack"]),
  suit: z.enum(["hearts", "clubs", "spades"]),
  damage: z.object({
    hearts: z.boolean(),
    clubs: z.boolean(),
    spades: z.boolean(),
  }),
  modifiers: z.object({
    hearts: statModifierSchema,
    clubs: statModifierSchema,
    spades: statModifierSchema,
  }),
  suitSkill: characterSkillSchema,
  characterIdentity: characterIdentitySchema,
  archetypeSkills: z.array(characterSkillSchema),
});

const settingSchema = z.array(genreSchema).min(1);

export const charactersRequestSchema = z.object({
  playerCount: z.int().min(1).max(9),
  setting: settingSchema,
});

export const scriptRequestSchema = z.object({
  characters: z.array(characterSheetSchema).min(1),
  setting: settingSchema,
});
