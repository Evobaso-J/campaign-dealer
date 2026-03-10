<script setup lang="ts">
import {
  archetypeInitials,
  type CharacterArchetype,
  type CharacterSuit,
} from "~~/shared/types/character";

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

function comboKey(archetype: CharacterArchetype, suit: CharacterSuit): string {
  return `${archetype}-${suit}`;
}

function comboClasses(archetype: CharacterArchetype, suit: CharacterSuit) {
  const key = comboKey(archetype, suit);
  const isSelected = props.selected.has(key);
  if (isSelected)
    return "bg-primary-400 border-2 border-primary-900 cursor-pointer";
  if (!props.canSelect)
    return "bg-primary-500 border-2 border-primary-700 opacity-50 cursor-not-allowed";
  return "bg-primary-500 border-2 border-primary-700 hover:bg-primary-400 cursor-pointer";
}
</script>

<template>
  <div
    class="lg:w-1/4 w-full pixel-border-thick pixel-shadow bg-primary-400/50 p-3 flex flex-col"
  >
    <span
      class="text-xs mb-3 pb-2 border-b-2 border-primary-900 text-primary-900"
    >
      {{ t("ui.selector.characters").toUpperCase() }}
    </span>

    <div role="list" class="overflow-y-auto max-h-80 space-y-1">
      <button
        v-for="combo in combinations"
        :key="comboKey(combo.archetype, combo.suit)"
        role="listitem"
        class="w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors text-primary-900"
        :class="comboClasses(combo.archetype, combo.suit)"
        :aria-label="`${t(`ui.selector.archetype.${combo.archetype}`)}-${t(`ui.selector.suit.${combo.suit}`)}`"
        :aria-pressed="selected.has(comboKey(combo.archetype, combo.suit))"
        :disabled="
          !canSelect && !selected.has(comboKey(combo.archetype, combo.suit))
        "
        @click="
          emit(
            'toggle',
            combo.archetype,
            combo.suit,
            !selected.has(comboKey(combo.archetype, combo.suit)),
          )
        "
      >
        <!-- Mini card icon (decorative, described by aria-label) -->
        <span
          aria-hidden="true"
          class="w-7 h-9 pixel-border flex flex-col items-center justify-center text-[0.5rem] leading-tight shrink-0 bg-primary-500/50"
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
