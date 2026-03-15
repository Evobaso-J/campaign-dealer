<script setup lang="ts">
import { archetypeInitials } from "~~/shared/types/character";
import type { CharacterTemplate } from "~~/shared/utils/characterRandomizer";

const props = defineProps<{
  card: CharacterTemplate | null;
  rotation: string;
}>();

const { t } = useI18n();

const cardAriaLabel = computed(() => {
  if (!props.card) return t("ui.selector.readyToJoin");
  return (
    t(`ui.selector.archetype.${props.card.archetype}`) +
    "-" +
    t(`ui.selector.suit.${props.card.suit}`)
  );
});
</script>

<template>
  <div class="relative w-28 aspect-5/7">
    <div
      role="img"
      :aria-label="cardAriaLabel"
      class="w-full h-full flex flex-col items-center justify-center text-center transition-all duration-200"
      :class="
        card
          ? ['pixel-border-thick bg-primary-400', rotation]
          : 'card-empty-slot'
      "
    >
      <template v-if="card">
        <div
          aria-hidden="true"
          class="absolute top-1 left-1.5 flex flex-col items-center leading-none"
        >
          <span class="text-xs font-bold">
            {{ archetypeInitials[card.archetype] }}
          </span>
          <UIcon :name="suitIcons[card.suit]!" class="text-sm" />
        </div>
        <NuxtImg
          :src="`/cards/${card.archetype}_${card.suit}.svg`"
          :alt="`${t(`ui.selector.archetype.${card.archetype}`)}-${t(`ui.selector.suit.${card.suit}`)}`"
          class="w-full p-1"
        />
        <div
          aria-hidden="true"
          class="absolute bottom-0 left-0 right-0 mx-1 mb-1 px-1.5 py-1 flex items-center justify-center bg-primary-400/90 border border-primary-700 h-1/4"
        >
          <span
            class="text-[0.45rem] leading-tight text-primary-900 text-center italic"
          >
            {{ t(card.archetypeSkills[0]!.name) }}
          </span>
        </div>
      </template>

      <template v-else>
        <div
          aria-hidden="true"
          class="absolute inset-1 border border-dashed border-primary-700 flex flex-col items-center justify-center gap-2"
        >
          <UIcon name="i-lucide-plus" class="text-primary-400 text-xl" />
          <span
            class="text-[0.4rem] text-primary-400 tracking-widest animate-blinker motion-reduce:animate-none"
          >
            {{ t("ui.selector.readyToJoin") }}
          </span>
        </div>
      </template>
    </div>
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
