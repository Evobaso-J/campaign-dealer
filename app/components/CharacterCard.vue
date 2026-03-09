<script setup lang="ts">
import { archetypeInitials } from "~~/shared/types/character";
import type { CharacterTemplate } from "~~/shared/utils/characterRandomizer";

defineProps<{
  card: CharacterTemplate | null;
  rotation: string;
}>();

const { t } = useI18n();

const suitIcons: Record<string, string> = {
  hearts: "i-mdi-cards-heart",
  clubs: "i-mdi-cards-club",
  spades: "i-mdi-cards-spade",
};
</script>

<template>
  <div
    class="relative w-28 aspect-5/7 flex flex-col items-center justify-center text-center transition-all duration-200"
    :class="
      card
        ? ['pixel-border-thick bg-primary-400 text-primary-800', rotation]
        : 'card-empty-slot'
    "
  >
    <!-- Filled card -->
    <template v-if="card">
      <div
        class="absolute top-1 left-1.5 flex flex-col items-center leading-none"
      >
        <span class="text-xs font-pixel font-bold">
          {{ archetypeInitials[card.archetype] }}
        </span>
        <UIcon :name="suitIcons[card.suit]!" class="text-sm" />
      </div>
      <!-- Image area placeholder -->
      <div class="w-full h-3/4" />
      <div
        class="absolute bottom-0 left-0 right-0 mx-1 mb-1 px-1.5 py-1 flex items-center justify-center bg-primary-500/40 border border-primary-700 h-1/4"
      >
        <span
          class="text-[0.45rem] leading-tight font-pixel text-primary-900 text-center italic"
        >
          {{ t(card.archetypeSkills[0]!.name) }}
        </span>
      </div>
    </template>

    <template v-else>
      <div
        class="absolute inset-1 border border-dashed border-primary-700 flex flex-col items-center justify-center gap-2"
      >
        <UIcon name="i-lucide-plus" class="text-primary-400 text-xl" />
        <span
          class="text-[0.4rem] text-primary-400 tracking-widest font-pixel animate-[blinker_1s_step-end_infinite]"
        >
          {{ t("ui.selector.readyToJoin") }}
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.card-empty-slot {
  background: repeating-conic-gradient(
      var(--ui-color-primary-800) 0% 25%,
      var(--ui-color-primary-900) 0% 50%
    )
    50% / 6px 6px;
  border: 2px dashed var(--ui-color-primary-700);
  position: relative;
}
</style>
