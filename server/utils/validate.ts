import { z } from "zod";
import { GenreGroups, Locales, type Genre, type Locale } from "~~/shared/types/campaign";
import {
  CharacterArchetype,
  CharacterSuit,
  type CharacterSheet,
} from "~~/shared/types/character";
import type { GeneratedText, I18nKey } from "~~/shared/types/utils";

const allGenres = Object.values(GenreGroups).flat();
const archetypes = Object.values(CharacterArchetype);
const suits = Object.values(CharacterSuit);

const genreSchema = z.enum(allGenres);
const generatedText = z.string() as unknown as z.ZodType<GeneratedText>;
const i18nKey = z.string() as unknown as z.ZodType<I18nKey>;

const characterItemSchema = z.object({
  name: generatedText,
  concealed: z.boolean(),
});

export const characterIdentitySchema = z.object({
  name: generatedText,
  pronouns: generatedText.optional(),
  concept: generatedText.optional(),
  weapon: characterItemSchema.optional(),
  instrument: characterItemSchema.optional(),
});

const characterSkillSchema = z.object({
  name: i18nKey,
  description: i18nKey,
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

const suitRecord = <T extends z.ZodType>(valueSchema: T) =>
  z.object(
    Object.fromEntries(suits.map((s) => [s, valueSchema])) as {
      [K in CharacterSuit]: T;
    },
  );

const characterSheetSchema: z.ZodType<CharacterSheet> = z.object({
  archetype: z.enum(archetypes),
  suit: z.enum(suits),
  damage: suitRecord(z.boolean()),
  modifiers: suitRecord(statModifierSchema),
  suitSkill: characterSkillSchema,
  characterIdentity: characterIdentitySchema,
  archetypeSkills: z.array(characterSkillSchema),
});

const settingSchema = z.array(genreSchema).min(1);

export const charactersRequestSchema: z.ZodType<{
  playerCount: number;
  setting: Genre[];
  language: Locale;
}> = z.object({
  playerCount: z.int().min(1).max(9),
  setting: settingSchema,
  language: z.enum(Locales),
});

export const scriptRequestSchema: z.ZodType<{
  characters: CharacterSheet[];
  setting: Genre[];
  language: Locale;
}> = z.object({
  characters: z.array(characterSheetSchema).min(1),
  setting: settingSchema,
  language: z.enum(Locales),
});
