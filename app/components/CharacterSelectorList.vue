<script setup lang="ts">
import {
  archetypeInitials,
  type CharacterArchetype,
  type CharacterSuit,
} from "~~/shared/types/character";
import { suitIcons } from "~/utils/suitIcons";

const { t } = useI18n();

const props = defineProps<{
  combinations: { archetype: CharacterArchetype; suit: CharacterSuit }[];
  selected: Set<string>;
  canSelect: boolean;
}>();

const emit = defineEmits<{
  toggle: [
    archetype: CharacterArchetype,
    suit: CharacterSuit,
    checked: boolean,
  ];
}>();

const enrichedCombinations = computed(() =>
  props.combinations.map((combo) => {
    const key = `${combo.archetype}-${combo.suit}`;
    const isSelected = props.selected.has(key);
    return { ...combo, key, isSelected };
  }),
);

function comboClasses(isSelected: boolean) {
  if (isSelected)
    return "bg-primary-400 border-2 border-primary-900 cursor-pointer";
  if (!props.canSelect)
    return "bg-primary-500 border-2 border-primary-700 opacity-50 cursor-not-allowed";
  return "bg-primary-500 border-2 border-primary-700 hover:bg-primary-400/40 cursor-pointer";
}

function handleToggle(
  archetype: CharacterArchetype,
  suit: CharacterSuit,
  isSelected: boolean,
) {
  emit("toggle", archetype, suit, !isSelected);
}
</script>

<template>
  <div
    class="lg:w-1/4 w-full pixel-border-thick pixel-shadow bg-primary-400/40 p-3 flex flex-col"
  >
    <span
      class="text-xs mb-3 pb-2 border-b-2 border-primary-900 text-primary-900"
    >
      {{ t("ui.selector.characters").toUpperCase() }}
    </span>

    <div role="list" class="overflow-y-auto max-h-80 space-y-1">
      <button
        v-for="combo in enrichedCombinations"
        :key="combo.key"
        role="listitem"
        class="w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors text-primary-900"
        :class="comboClasses(combo.isSelected)"
        :aria-label="`${t(`ui.selector.archetype.${combo.archetype}`)}-${t(`ui.selector.suit.${combo.suit}`)}`"
        :aria-pressed="combo.isSelected"
        :disabled="!canSelect && !combo.isSelected"
        @click="handleToggle(combo.archetype, combo.suit, combo.isSelected)"
      >
        <span
          aria-hidden="true"
          class="w-7 h-9 pixel-border flex flex-col items-center justify-center text-[0.5rem] leading-tight shrink-0 bg-primary-400/50"
        >
          <span>{{ archetypeInitials[combo.archetype] }}</span>
          <span>
            <UIcon :name="suitIcons[combo.suit]!" />
          </span>
        </span>

        <span
          aria-hidden="true"
          class="flex items-center gap-1 text-xs uppercase tracking-wider min-w-0"
        >
          <span class="truncate">{{
            t(`ui.selector.archetype.${combo.archetype}`)
          }}</span>
          <UIcon :name="suitIcons[combo.suit]!" class="shrink-0" />
        </span>
      </button>
    </div>
  </div>
</template>
