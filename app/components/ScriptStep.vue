<script setup lang="ts">
import { useCharacterPdf } from "~/composables/useCharacterPdf";

const store = useCampaignStore();
const { openPdf } = useCharacterPdf();
</script>

<template>
  <div v-if="store.gmScript" class="flex flex-col gap-4 flex-1 min-h-0">
    <GmScript class="flex-1 min-h-0" />
    <div v-if="store.characters.length" class="grid grid-cols-4 gap-4 shrink-0">
      <CharacterSheet
        v-for="(char, idx) in store.characters"
        :key="idx"
        :character="char"
        @open-pdf="openPdf(char)"
      />
    </div>
  </div>
</template>
