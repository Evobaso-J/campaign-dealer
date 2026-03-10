<script setup lang="ts">
import {
  buildAllCharacterCombinations,
  generateCharacterTemplate,
  type CharacterTemplate,
} from "~~/shared/utils/characterRandomizer";
import type { CharacterArchetype } from "~~/shared/types/character";

const MAX_PARTY = 4;

const { t } = useI18n();

const emit = defineEmits<{
  "update:modelValue": [value: CharacterTemplate[]];
}>();

defineProps<{
  modelValue: CharacterTemplate[];
}>();

const cardRotations = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

const combinations = buildAllCharacterCombinations();

const selected = ref<Set<string>>(new Set());
const templates = ref<Map<string, CharacterTemplate>>(new Map());
const selectionOrder = ref<string[]>([]);

const partySize = computed(() => selected.value.size);
const canSelect = computed(() => partySize.value < MAX_PARTY);

function comboKey(archetype: CharacterArchetype, suit: string): string {
  return `${archetype}-${suit}`;
}

function toggleCombo(
  archetype: CharacterArchetype,
  suit: string,
  checked: boolean,
) {
  const key = comboKey(archetype, suit);
  const newSelected = new Set(selected.value);
  const newTemplates = new Map(templates.value);
  const newOrder = [...selectionOrder.value];

  if (checked) {
    if (newSelected.size >= MAX_PARTY) return;
    const template = generateCharacterTemplate(
      archetype,
      suit as CharacterTemplate["suit"],
    );
    newSelected.add(key);
    newTemplates.set(key, template);
    newOrder.push(key);
  } else {
    newSelected.delete(key);
    newTemplates.delete(key);
    const idx = newOrder.indexOf(key);
    if (idx !== -1) newOrder.splice(idx, 1);
  }

  selected.value = newSelected;
  templates.value = newTemplates;
  selectionOrder.value = newOrder;

  const ordered = newOrder
    .map((k) => newTemplates.get(k))
    .filter((t): t is CharacterTemplate => t !== undefined);
  emit("update:modelValue", ordered);
}

const drawRandom = () => {
  const unselected = combinations.filter(
    (c) => !selected.value.has(comboKey(c.archetype, c.suit)),
  );
  if (unselected.length === 0 || !canSelect.value) return;
  const pick = unselected[Math.floor(Math.random() * unselected.length)]!;
  toggleCombo(pick.archetype, pick.suit, true);
};

const orderedCards = computed(() => {
  const cards: (CharacterTemplate | null)[] = [];
  for (const key of selectionOrder.value) {
    const tmpl = templates.value.get(key);
    if (tmpl) cards.push(tmpl);
  }
  while (cards.length < MAX_PARTY) cards.push(null);
  return cards;
});
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-4">
    <CharacterSelectorList
      :combinations="combinations"
      :selected="selected"
      :can-select="canSelect"
      @toggle="toggleCombo"
    />

    <!-- Right panel: card arena -->
    <div
      class="lg:w-3/4 w-full pixel-border-thick pixel-shadow bg-primary-400/10 p-3 flex flex-col gap-3 self-start"
    >
      <!-- Arena area -->
      <div
        class="border-2 border-primary-900 bg-primary-500/10 p-4 flex items-center justify-center bg-[linear-gradient(var(--ui-color-primary-800)_1px,transparent_1px),linear-gradient(90deg,var(--ui-color-primary-800)_1px,transparent_1px)] bg-size-[20px_20px]"
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

      <!-- Bottom bar: stats + actions -->
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
            :disabled="!canSelect"
            @click="drawRandom"
          >
            {{ t("ui.selector.drawRandom") }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
