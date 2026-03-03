<script setup lang="ts">
import { GenreGroups } from "~~/shared/types/campaign";
import type { Genre } from "~~/shared/types/campaign";
import type { CharacterSheet } from "~~/shared/types/character";

const { fetchCharacters, fetchScript, generateCampaign, store } = useCampaign();
const { locale } = useI18n();

// --- Shared inputs ---
const playerCount = ref(2);
const selectedGenres = ref<Genre[]>(["cyberpunk"]);

// --- Section 1: fetchCharacters ---
const characters = ref<CharacterSheet[] | null>(null);
const fetchingCharacters = ref(false);
const charactersError = ref<string | null>(null);

async function onFetchCharacters() {
  characters.value = null;
  charactersError.value = null;
  fetchingCharacters.value = true;
  try {
    characters.value = await fetchCharacters(
      playerCount.value,
      selectedGenres.value,
      locale.value,
    );
  } catch (e: unknown) {
    charactersError.value = e instanceof Error ? e.message : String(e);
  } finally {
    fetchingCharacters.value = false;
  }
}

// --- Section 2: fetchScript ---
const script = ref<unknown>(null);
const fetchingScript = ref(false);
const scriptError = ref<string | null>(null);

async function onFetchScript() {
  if (!characters.value?.length) {
    scriptError.value = "Fetch characters first.";
    return;
  }
  script.value = null;
  scriptError.value = null;
  fetchingScript.value = true;
  try {
    script.value = await fetchScript(
      characters.value,
      selectedGenres.value,
      locale.value,
    );
  } catch (e: unknown) {
    scriptError.value = e instanceof Error ? e.message : String(e);
  } finally {
    fetchingScript.value = false;
  }
}

// --- Section 3: full flow ---
async function onGenerateCampaign() {
  await generateCampaign(playerCount.value, selectedGenres.value);
}

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

    <!-- Section 1: fetchCharacters -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">1. fetchCharacters (standalone)</h2>
      </template>

      <div class="space-y-4">
        <UButton
          :loading="fetchingCharacters"
          :disabled="fetchingCharacters"
          @click="onFetchCharacters"
        >
          Fetch Characters
        </UButton>

        <UAlert
          v-if="charactersError"
          color="error"
          icon="i-lucide-circle-x"
          :description="charactersError"
        />

        <pre v-if="characters" class="overflow-auto max-h-96 bg-neutral-100 dark:bg-neutral-900 p-4 rounded text-sm font-mono">{{ JSON.stringify(characters, null, 2) }}</pre>
      </div>
    </UCard>

    <!-- Section 2: fetchScript -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">2. fetchScript (standalone)</h2>
      </template>

      <div class="space-y-4">
        <p class="text-sm text-neutral-500">
          Uses characters from section 1. Fetch those first.
        </p>

        <UButton
          :loading="fetchingScript"
          :disabled="fetchingScript"
          @click="onFetchScript"
        >
          Fetch Script
        </UButton>

        <UAlert
          v-if="scriptError"
          color="error"
          icon="i-lucide-circle-x"
          :description="scriptError"
        />

        <pre v-if="script" class="overflow-auto max-h-96 bg-neutral-100 dark:bg-neutral-900 p-4 rounded text-sm font-mono">{{ JSON.stringify(script, null, 2) }}</pre>
      </div>
    </UCard>

    <!-- Section 3: generateCampaign (full flow) -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">3. generateCampaign (full flow)</h2>
      </template>

      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-sm">Status:</span>
          <UBadge :color="store.isLoading ? 'warning' : 'neutral'" variant="subtle">
            {{ store.generationStatus }}
          </UBadge>
          <UIcon v-if="store.isLoading" name="i-lucide-loader-circle" class="animate-spin" />
        </div>

        <div class="flex gap-2">
          <UButton
            :loading="store.isLoading"
            :disabled="store.isLoading"
            @click="onGenerateCampaign"
          >
            Generate Campaign
          </UButton>
          <UButton color="neutral" variant="outline" @click="store.reset()">
            Reset Store
          </UButton>
        </div>

        <UAlert
          v-if="store.errorMessage"
          color="error"
          icon="i-lucide-circle-x"
          :description="store.errorMessage"
        />

        <div v-if="store.hasResult" class="space-y-4">
          <div>
            <h3 class="text-base font-medium mb-2">Characters</h3>
            <pre class="overflow-auto max-h-80 bg-neutral-100 dark:bg-neutral-900 p-4 rounded text-sm font-mono">{{ JSON.stringify(store.characters, null, 2) }}</pre>
          </div>
          <div>
            <h3 class="text-base font-medium mb-2">GM Script</h3>
            <pre class="overflow-auto max-h-80 bg-neutral-100 dark:bg-neutral-900 p-4 rounded text-sm font-mono">{{ JSON.stringify(store.gmScript, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
