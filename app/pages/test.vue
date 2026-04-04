<script setup lang="ts">
import { GenreGroups } from "~~/shared/types/campaign";
import type { Genre, TargetArchetype } from "~~/shared/types/campaign";
import { generateCharacterTemplate } from "~~/shared/utils/characterRandomizer";

const targetArchetypes: TargetArchetype[] = ["king", "queen", "jack"];

const { generateCharacters, generateScript } = useCampaign();
const store = useCampaignStore();
const { t } = useI18n();

// --- Shared inputs ---
const selectedGenres = ref<Genre[]>(["cyberpunk"]);

// Pre-populate with some templates for dev testing
const devTemplates = [
  generateCharacterTemplate("king", "hearts"),
  generateCharacterTemplate("queen", "clubs"),
];

const allGenres = Object.values(GenreGroups).flat() as Genre[];
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold font-mono">useCampaign — Dev Test Page</h1>

    <!-- Shared inputs -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Shared Inputs</h2>
      </template>

      <div class="space-y-4">
        <div>
          <p class="text-sm font-medium mb-2">Genres</p>
          <div class="flex flex-wrap gap-3">
            <UCheckbox
              v-for="genre in allGenres"
              :key="genre"
              :model-value="selectedGenres.includes(genre)"
              :label="genre"
              @update:model-value="
                (checked) => {
                  if (checked) selectedGenres.push(genre);
                  else selectedGenres.splice(selectedGenres.indexOf(genre), 1);
                }
              "
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Status bar -->
    <div class="flex items-center gap-2">
      <span class="text-sm">Status:</span>
      <UBadge :color="store.isLoading ? 'warning' : 'neutral'" variant="subtle">
        {{ store.generationStatus }}
      </UBadge>
      <UIcon
        v-if="store.isLoading"
        name="i-pixelarticons-loader"
        class="animate-spin"
      />
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        class="ml-auto"
        @click="store.reset()"
      >
        Reset
      </UButton>
    </div>

    <UAlert
      v-if="store.errorMessage"
      color="error"
      icon="i-pixelarticons-close-box"
      :description="store.errorMessage"
    />

    <!-- Section 1: generateCharacters -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">1. generateCharacters</h2>
      </template>

      <div class="space-y-4">
        <UButton
          :loading="store.generationStatus === 'generating-characters'"
          :disabled="store.isLoading"
          @click="generateCharacters(devTemplates, selectedGenres)"
        >
          Generate Characters
        </UButton>

        <div v-if="store.characters.length" class="space-y-3">
          <UCard v-for="(char, i) in store.characters" :key="i">
            <template #header>
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-semibold">{{
                    char.characterIdentity.name
                  }}</span>
                  <span
                    v-if="char.characterIdentity.pronouns"
                    class="text-sm text-neutral-500 ml-2"
                    >({{ char.characterIdentity.pronouns }})</span
                  >
                </div>
                <div class="flex gap-2">
                  <UBadge color="neutral" variant="outline">{{
                    char.archetype
                  }}</UBadge>
                  <UBadge color="neutral" variant="outline">{{
                    char.suit
                  }}</UBadge>
                </div>
              </div>
            </template>

            <div class="space-y-3 text-sm">
              <p
                v-if="char.characterIdentity.concept"
                class="italic text-neutral-600 dark:text-neutral-400"
              >
                {{ char.characterIdentity.concept }}
              </p>

              <div class="flex gap-4">
                <div v-if="char.characterIdentity.weapon">
                  <span class="font-medium">Weapon:</span>
                  {{ char.characterIdentity.weapon.name }}
                  <UBadge
                    v-if="char.characterIdentity.weapon.concealed"
                    size="sm"
                    color="neutral"
                    variant="subtle"
                    >concealed</UBadge
                  >
                </div>
                <div v-if="char.characterIdentity.instrument">
                  <span class="font-medium">Instrument:</span>
                  {{ char.characterIdentity.instrument.name }}
                  <UBadge
                    v-if="char.characterIdentity.instrument.concealed"
                    size="sm"
                    color="neutral"
                    variant="subtle"
                    >concealed</UBadge
                  >
                </div>
              </div>

              <USeparator />

              <div>
                <p class="font-medium mb-1">Suit skill</p>
                <p>
                  <span class="font-medium">{{ t(char.suitSkill.name) }}</span>
                  — {{ t(char.suitSkill.description) }}
                </p>
              </div>

              <div>
                <p class="font-medium mb-1">Archetype skills</p>
                <ul class="space-y-1">
                  <li v-for="(skill, j) in char.archetypeSkills" :key="j">
                    <span class="font-medium">{{ t(skill.name) }}</span> —
                    {{ t(skill.description) }}
                    <span v-if="skill.uses" class="text-neutral-400 ml-1"
                      >({{ skill.uses.usesLeft }}/{{
                        skill.uses.maxUses
                      }})</span
                    >
                  </li>
                </ul>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </UCard>

    <!-- Section 2: generateScript -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">2. generateScript</h2>
      </template>

      <div class="space-y-4">
        <p class="text-sm text-neutral-500">
          Uses characters from step 1. Generate those first.
        </p>

        <UButton
          :loading="store.generationStatus === 'generating-script'"
          :disabled="store.isLoading || !store.characters.length"
          @click="generateScript()"
        >
          Generate Script
        </UButton>

        <div v-if="store.gmScript" class="space-y-4">
          <!-- Content Warnings -->
          <UCard v-if="store.gmScript.contentWarnings?.length">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-pixelarticons-warning-box"
                  class="text-neutral-500"
                />
                <h3 class="font-semibold">Content Warnings</h3>
              </div>
            </template>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="(warning, i) in store.gmScript.contentWarnings"
                :key="i"
                color="warning"
                variant="subtle"
              >
                {{ warning }}
              </UBadge>
            </div>
          </UCard>

          <!-- Introduction -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-pixelarticons-anchor" class="text-neutral-500" />
                <h3 class="font-semibold">Introduction</h3>
              </div>
            </template>
            <p
              class="italic text-neutral-700 dark:text-neutral-300 whitespace-pre-line"
            >
              {{ store.gmScript.introduction }}
            </p>
          </UCard>

          <!-- Weapons & Instruments -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-pixelarticons-sword"
                    class="text-neutral-500"
                  />
                  <h3 class="font-semibold">Weapons</h3>
                </div>
              </template>
              <p class="text-sm italic text-neutral-600 dark:text-neutral-400">
                {{ store.gmScript.weapons.join(", ") }}
              </p>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-pixelarticons-briefcase"
                    class="text-neutral-500"
                  />
                  <h3 class="font-semibold">Instruments</h3>
                </div>
              </template>
              <p class="text-sm italic text-neutral-600 dark:text-neutral-400">
                {{ store.gmScript.instruments.join(", ") }}
              </p>
            </UCard>
          </div>

          <!-- Targets -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-pixelarticons-target" class="text-neutral-500" />
                <h3 class="font-semibold">Targets</h3>
              </div>
            </template>
            <div class="space-y-6">
              <div v-for="(arch, idx) in targetArchetypes" :key="arch">
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <UBadge
                      color="neutral"
                      variant="outline"
                      class="capitalize shrink-0"
                      >{{ arch }}</UBadge
                    >
                    <p class="font-semibold text-lg">
                      {{ store.gmScript.targets[arch].name }}
                    </p>
                  </div>
                  <p
                    class="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line"
                  >
                    {{ store.gmScript.targets[arch].description }}
                  </p>
                  <div
                    class="pl-4 border-l-2 border-neutral-200 dark:border-neutral-700 space-y-2"
                  >
                    <div>
                      <p
                        class="text-xs font-semibold uppercase text-neutral-500"
                      >
                        Locations
                      </p>
                      <p class="text-sm">
                        {{ store.gmScript.targets[arch].locations }}
                      </p>
                    </div>
                    <div>
                      <p
                        class="text-xs font-semibold uppercase text-neutral-500"
                      >
                        Defenses
                      </p>
                      <p class="text-sm">
                        {{ store.gmScript.targets[arch].defenses }}
                      </p>
                    </div>
                  </div>
                  <UBadge
                    v-if="store.gmScript.targets[arch].fate"
                    color="neutral"
                    variant="subtle"
                    size="sm"
                    class="capitalize"
                    >{{ store.gmScript.targets[arch].fate }}</UBadge
                  >
                </div>
                <USeparator
                  v-if="idx < targetArchetypes.length - 1"
                  class="mt-4"
                />
              </div>
            </div>
          </UCard>

          <!-- Rumors -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-pixelarticons-chat" class="text-neutral-500" />
                <h3 class="font-semibold">Rumors</h3>
                <UBadge color="neutral" variant="subtle" size="sm">{{
                  store.gmScript.rumors.length
                }}</UBadge>
              </div>
            </template>
            <div class="space-y-3">
              <div
                v-for="(rumor, i) in store.gmScript.rumors"
                :key="i"
                class="flex gap-3 p-2 rounded-md bg-neutral-50 dark:bg-neutral-800/50"
              >
                <span class="text-neutral-400 font-mono text-xs shrink-0 pt-0.5"
                  >{{ i + 1 }}.</span
                >
                <p class="text-sm italic">"{{ rumor }}"</p>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </UCard>
  </div>
</template>
