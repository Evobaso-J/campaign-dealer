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
    characters.value = await fetchCharacters(playerCount.value, selectedGenres.value, locale.value);
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
    script.value = await fetchScript(characters.value, selectedGenres.value, locale.value);
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
  <div style="font-family: monospace; padding: 2rem; max-width: 900px; margin: 0 auto;">
    <h1>useCampaign — Dev Test Page</h1>

    <!-- Shared inputs -->
    <section style="margin-bottom: 2rem; border: 1px solid #ccc; padding: 1rem;">
      <h2>Shared Inputs</h2>

      <label>
        Player count:
        <input v-model.number="playerCount" type="number" min="1" max="6" style="width: 4rem; margin-left: 0.5rem;" >
      </label>

      <div style="margin-top: 1rem;">
        <strong>Genres:</strong>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
          <label v-for="genre in allGenres" :key="genre" style="cursor: pointer;">
            <input
              v-model="selectedGenres"
              type="checkbox"
              :value="genre"
            >
            {{ genre }}
          </label>
        </div>
      </div>
    </section>

    <!-- Section 1: fetchCharacters -->
    <section style="margin-bottom: 2rem; border: 1px solid #ccc; padding: 1rem;">
      <h2>1. fetchCharacters (standalone)</h2>
      <button :disabled="fetchingCharacters" @click="onFetchCharacters">
        {{ fetchingCharacters ? "Loading…" : "Fetch Characters" }}
      </button>
      <p v-if="charactersError" style="color: red;">{{ charactersError }}</p>
      <pre v-if="characters" style="overflow: auto; max-height: 400px; background: #f5f5f5; padding: 1rem;">{{ JSON.stringify(characters, null, 2) }}</pre>
    </section>

    <!-- Section 2: fetchScript -->
    <section style="margin-bottom: 2rem; border: 1px solid #ccc; padding: 1rem;">
      <h2>2. fetchScript (standalone)</h2>
      <p style="color: #666; font-size: 0.9rem;">Uses characters from section 1. Fetch those first.</p>
      <button :disabled="fetchingScript" @click="onFetchScript">
        {{ fetchingScript ? "Loading…" : "Fetch Script" }}
      </button>
      <p v-if="scriptError" style="color: red;">{{ scriptError }}</p>
      <pre v-if="script" style="overflow: auto; max-height: 400px; background: #f5f5f5; padding: 1rem;">{{ JSON.stringify(script, null, 2) }}</pre>
    </section>

    <!-- Section 3: generateCampaign (full flow) -->
    <section style="border: 1px solid #ccc; padding: 1rem;">
      <h2>3. generateCampaign (full flow)</h2>
      <p>
        Status: <strong>{{ store.generationStatus }}</strong>
        <span v-if="store.isLoading"> ⏳</span>
      </p>
      <button :disabled="store.isLoading" @click="onGenerateCampaign">
        {{ store.isLoading ? "Generating…" : "Generate Campaign" }}
      </button>
      <button style="margin-left: 0.5rem;" @click="store.reset()">Reset Store</button>

      <p v-if="store.errorMessage" style="color: red; margin-top: 0.5rem;">{{ store.errorMessage }}</p>

      <div v-if="store.hasResult" style="margin-top: 1rem;">
        <h3>Characters</h3>
        <pre style="overflow: auto; max-height: 300px; background: #f5f5f5; padding: 1rem;">{{ JSON.stringify(store.characters, null, 2) }}</pre>
        <h3>GM Script</h3>
        <pre style="overflow: auto; max-height: 300px; background: #f5f5f5; padding: 1rem;">{{ JSON.stringify(store.gmScript, null, 2) }}</pre>
      </div>
    </section>
  </div>
</template>
