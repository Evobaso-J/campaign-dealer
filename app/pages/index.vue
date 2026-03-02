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
  <div class="font-mono p-8 max-w-4xl mx-auto">
    <h1>useCampaign — Dev Test Page</h1>

    <!-- Shared inputs -->
    <section class="mb-8 border border-gray-300 p-4">
      <h2>Shared Inputs</h2>

      <label>
        Player count:
        <input
          v-model.number="playerCount"
          type="number"
          min="1"
          max="6"
          class="w-16 ml-2"
        >
      </label>

      <div class="mt-4">
        <strong>Genres:</strong>
        <div class="flex flex-wrap gap-2 mt-2">
          <label v-for="genre in allGenres" :key="genre" class="cursor-pointer">
            <input v-model="selectedGenres" type="checkbox" :value="genre" >
            {{ genre }}
          </label>
        </div>
      </div>
    </section>

    <!-- Section 1: fetchCharacters -->
    <section class="mb-8 border border-gray-300 p-4">
      <h2>1. fetchCharacters (standalone)</h2>
      <button :disabled="fetchingCharacters" @click="onFetchCharacters">
        {{ fetchingCharacters ? "Loading…" : "Fetch Characters" }}
      </button>
      <p v-if="charactersError" class="text-red-600">{{ charactersError }}</p>
      <pre v-if="characters" class="overflow-auto max-h-96 bg-gray-100 p-4">{{
        JSON.stringify(characters, null, 2)
      }}</pre>
    </section>

    <!-- Section 2: fetchScript -->
    <section class="mb-8 border border-gray-300 p-4">
      <h2>2. fetchScript (standalone)</h2>
      <p class="text-gray-600 text-sm">
        Uses characters from section 1. Fetch those first.
      </p>
      <button :disabled="fetchingScript" @click="onFetchScript">
        {{ fetchingScript ? "Loading…" : "Fetch Script" }}
      </button>
      <p v-if="scriptError" class="text-red-600">{{ scriptError }}</p>
      <pre v-if="script" class="overflow-auto max-h-96 bg-gray-100 p-4">{{
        JSON.stringify(script, null, 2)
      }}</pre>
    </section>

    <!-- Section 3: generateCampaign (full flow) -->
    <section class="border border-gray-300 p-4">
      <h2>3. generateCampaign (full flow)</h2>
      <p>
        Status: <strong>{{ store.generationStatus }}</strong>
        <span v-if="store.isLoading"> ⏳</span>
      </p>
      <button :disabled="store.isLoading" @click="onGenerateCampaign">
        {{ store.isLoading ? "Generating…" : "Generate Campaign" }}
      </button>
      <button class="ml-2" @click="store.reset()">Reset Store</button>

      <p v-if="store.errorMessage" class="text-red-600 mt-2">
        {{ store.errorMessage }}
      </p>

      <div v-if="store.hasResult" class="mt-4">
        <h3>Characters</h3>
        <pre class="overflow-auto max-h-80 bg-gray-100 p-4">{{
          JSON.stringify(store.characters, null, 2)
        }}</pre>
        <h3>GM Script</h3>
        <pre class="overflow-auto max-h-80 bg-gray-100 p-4">{{
          JSON.stringify(store.gmScript, null, 2)
        }}</pre>
      </div>
    </section>
  </div>
</template>
