<script setup lang="ts">
import { GenreGroups } from "~~/shared/types/campaign";
import type { Genre, TargetArchetype } from "~~/shared/types/campaign";

const targetArchetypes: TargetArchetype[] = ["king", "queen", "jack"];

const { generateCharacters, generateScript } = useCampaign();
const store = useCampaignStore();
const { t } = useI18n();

// --- Shared inputs ---
const playerCount = ref(2);
const selectedGenres = ref<Genre[]>(["cyberpunk"]);

const allGenres = Object.values(GenreGroups).flat() as Genre[];
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold font-mono">
      useCampaign — Dev Test Page
    </h1>

    <!-- Shared inputs -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Shared Inputs</h2>
      </template>

      <div class="space-y-4">
        <UFormField label="Player count">
          <UInputNumber
            v-model="playerCount"
            :min="1"
            :max="6"
            class="w-32"
          />
        </UFormField>

        <div>
          <p class="text-sm font-medium mb-2">Genres</p>
          <div class="flex flex-wrap gap-3">
            <UCheckbox
              v-for="genre in allGenres"
              :key="genre"
              :model-value="selectedGenres.includes(genre)"
              :label="genre"
              @update:model-value="(checked) => {
                if (checked) selectedGenres.push(genre);
                else selectedGenres.splice(selectedGenres.indexOf(genre), 1);
              }"
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
      <UIcon v-if="store.isLoading" name="i-lucide-loader-circle" class="animate-spin" />
      <UButton color="neutral" variant="outline" size="sm" class="ml-auto" @click="store.reset()">
        Reset
      </UButton>
    </div>

    <UAlert
      v-if="store.errorMessage"
      color="error"
      icon="i-lucide-circle-x"
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
          @click="generateCharacters(playerCount, selectedGenres)"
        >
          Generate Characters
        </UButton>

        <div v-if="store.characters.length" class="space-y-3">
          <UCard v-for="(char, i) in store.characters" :key="i">
            <template #header>
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-semibold">{{ char.characterIdentity.name }}</span>
                  <span v-if="char.characterIdentity.pronouns" class="text-sm text-neutral-500 ml-2">({{ char.characterIdentity.pronouns }})</span>
                </div>
                <div class="flex gap-2">
                  <UBadge color="neutral" variant="outline">{{ char.archetype }}</UBadge>
                  <UBadge color="neutral" variant="outline">{{ char.suit }}</UBadge>
                </div>
              </div>
            </template>

            <div class="space-y-3 text-sm">
              <p v-if="char.characterIdentity.concept" class="italic text-neutral-600 dark:text-neutral-400">
                {{ char.characterIdentity.concept }}
              </p>

              <div class="flex gap-4">
                <div v-if="char.characterIdentity.weapon">
                  <span class="font-medium">Weapon:</span>
                  {{ char.characterIdentity.weapon.name }}
                  <UBadge v-if="char.characterIdentity.weapon.concealed" size="sm" color="neutral" variant="subtle">concealed</UBadge>
                </div>
                <div v-if="char.characterIdentity.instrument">
                  <span class="font-medium">Instrument:</span>
                  {{ char.characterIdentity.instrument.name }}
                  <UBadge v-if="char.characterIdentity.instrument.concealed" size="sm" color="neutral" variant="subtle">concealed</UBadge>
                </div>
              </div>

              <USeparator />

              <div>
                <p class="font-medium mb-1">Suit skill</p>
                <p><span class="font-medium">{{ t(char.suitSkill.name) }}</span> — {{ t(char.suitSkill.description) }}</p>
              </div>

              <div>
                <p class="font-medium mb-1">Archetype skills</p>
                <ul class="space-y-1">
                  <li v-for="(skill, j) in char.archetypeSkills" :key="j">
                    <span class="font-medium">{{ t(skill.name) }}</span> — {{ t(skill.description) }}
                    <span v-if="skill.uses" class="text-neutral-400 ml-1">({{ skill.uses.usesLeft }}/{{ skill.uses.maxUses }})</span>
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
          @click="generateScript(selectedGenres)"
        >
          Generate Script
        </UButton>

        <div v-if="store.gmScript" class="space-y-4">
          <!-- Hook -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-anchor" class="text-neutral-500" />
                <h3 class="font-semibold">Hook</h3>
              </div>
            </template>
            <p class="italic text-neutral-700 dark:text-neutral-300">{{ store.gmScript.hook }}</p>
          </UCard>

          <!-- Central Tension -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-zap" class="text-neutral-500" />
                <h3 class="font-semibold">Central Tension</h3>
              </div>
            </template>
            <p>{{ store.gmScript.centralTension }}</p>
          </UCard>

          <!-- Plot -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-book-open" class="text-neutral-500" />
                <h3 class="font-semibold">Plot</h3>
              </div>
            </template>
            <p>{{ store.gmScript.plot }}</p>
          </UCard>

          <!-- Targets -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-crosshair" class="text-neutral-500" />
                <h3 class="font-semibold">Antagonist Targets</h3>
              </div>
            </template>
            <div class="space-y-4">
              <div v-for="(arch, idx) in targetArchetypes" :key="arch">
                <div class="flex items-start gap-3">
                  <UBadge color="neutral" variant="outline" class="capitalize shrink-0 mt-0.5">{{ arch }}</UBadge>
                  <div class="space-y-1 min-w-0">
                    <p class="font-medium">{{ store.gmScript.targets[arch].name }}</p>
                    <p class="text-sm text-neutral-600 dark:text-neutral-400">{{ store.gmScript.targets[arch].description }}</p>
                    <UBadge v-if="store.gmScript.targets[arch].fate" color="neutral" variant="subtle" size="sm" class="capitalize">{{ store.gmScript.targets[arch].fate }}</UBadge>
                  </div>
                </div>
                <USeparator v-if="idx < targetArchetypes.length - 1" class="mt-4" />
              </div>
            </div>
          </UCard>

          <!-- Scenes -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-film" class="text-neutral-500" />
                <h3 class="font-semibold">Scenes</h3>
                <UBadge color="neutral" variant="subtle" size="sm">{{ store.gmScript.scenes.length }}</UBadge>
              </div>
            </template>
            <ol class="space-y-3">
              <li v-for="(scene, i) in store.gmScript.scenes" :key="i" class="flex gap-3">
                <span class="text-neutral-400 font-mono text-sm shrink-0 pt-px">{{ String(i + 1).padStart(2, '0') }}</span>
                <p class="text-sm">{{ scene }}</p>
              </li>
            </ol>
          </UCard>

          <!-- Weak Points -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-shield-off" class="text-neutral-500" />
                <h3 class="font-semibold">Weak Points</h3>
                <UBadge color="neutral" variant="subtle" size="sm">{{ store.gmScript.weakPoints.length }}</UBadge>
              </div>
            </template>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                v-for="(wp, i) in store.gmScript.weakPoints"
                :key="i"
                class="flex gap-2 p-2 rounded-md bg-neutral-50 dark:bg-neutral-800/50"
              >
                <span class="text-neutral-400 font-mono text-xs shrink-0 pt-0.5">{{ i + 1 }}.</span>
                <div class="min-w-0">
                  <p class="text-sm font-medium">{{ wp.name }}</p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ wp.role }}</p>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </UCard>
  </div>
</template>
