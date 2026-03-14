<script setup lang="ts">
import {
  buildAllCharacterCombinations,
  generateCharacterTemplate,
  type CharacterTemplate,
} from "~~/shared/utils/characterRandomizer";
import type { CharacterCombo } from "~~/shared/types/character";

const MAX_PARTY = 4;

const { t } = useI18n();

const emit = defineEmits<{
  "update:modelValue": [value: CharacterTemplate[]];
}>();

const props = defineProps<{
  modelValue: CharacterTemplate[];
}>();

const cardRotations = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

const combinations = buildAllCharacterCombinations();

const isSameCombo = (a: CharacterCombo, b: CharacterCombo) =>
  a.archetype === b.archetype && a.suit === b.suit;

const selectedTemplates = ref<CharacterTemplate[]>([]);

watch(
  () => props.modelValue,
  (value) => {
    if (value.length > 0) {
      selectedTemplates.value = [...value];
    } else {
      selectedTemplates.value = [];
    }
  },
  { immediate: true },
);

const partySize = computed(() => selectedTemplates.value.length);
const isSelectable = computed(() => partySize.value < MAX_PARTY);

const selectCard = (combo: CharacterCombo) => {
  if (!isSelectable.value) return;
  selectedTemplates.value = [
    ...selectedTemplates.value,
    generateCharacterTemplate(combo.archetype, combo.suit),
  ];
};

const deselectCard = (combo: CharacterCombo) => {
  selectedTemplates.value = selectedTemplates.value.filter(
    (t) => !isSameCombo(t, combo),
  );
};

const toggleCard = (combo: CharacterCombo, checked: boolean) => {
  if (checked) selectCard(combo);
  else deselectCard(combo);
  emit("update:modelValue", selectedTemplates.value);
};

const drawRandom = () => {
  const unselected = combinations.filter(
    (c) => !selectedTemplates.value.some((t) => isSameCombo(t, c)),
  );
  if (unselected.length === 0 || !isSelectable.value) return;
  const pick = unselected[Math.floor(Math.random() * unselected.length)]!;
  selectCard(pick);
  emit("update:modelValue", selectedTemplates.value);
};

const orderedCards = computed((): (CharacterTemplate | null)[] => {
  const empty = Array<null>(MAX_PARTY - selectedTemplates.value.length).fill(
    null,
  );
  return [...selectedTemplates.value, ...empty];
});
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-4">
    <CharacterSelectorList
      :combinations="combinations"
      :is-selected="
        (combo) => selectedTemplates.some((t) => isSameCombo(t, combo))
      "
      :can-select="isSelectable"
      @toggle="toggleCard"
    />

    <!-- Right panel: card arena -->
    <div
      class="lg:w-3/4 w-full pixel-border-thick pixel-shadow bg-primary-400/10 p-3 flex flex-col gap-3 self-start"
    >
      <!-- Arena area -->
      <div
        class="border-2 border-primary-900 bg-primary/10 p-4 flex items-center justify-center bg-[linear-gradient(var(--ui-color-primary-800)_1px,transparent_1px),linear-gradient(90deg,var(--ui-color-primary-800)_1px,transparent_1px)] bg-size-[20px_20px]"
      >
        <div class="flex flex-wrap justify-center gap-4">
          <CharacterCard
            v-for="(card, i) in orderedCards"
            :key="i"
            :card="card"
            :rotation="cardRotations[i]!"
          />
        </div>
      </div>

      <div class="flex items-center justify-between flex-wrap gap-2">
        <span
          aria-live="polite"
          aria-atomic="true"
          class="text-xs text-primary-800 tracking-wider"
        >
          {{
            t("ui.selector.lineUpCount", {
              partySize,
              maxParty: MAX_PARTY,
            }).toUpperCase()
          }}
        </span>

        <div class="flex items-center gap-2">
          <UButton
            variant="outline"
            color="neutral"
            size="xs"
            :disabled="!isSelectable"
            @click="drawRandom"
          >
            {{ t("ui.selector.drawRandom") }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
