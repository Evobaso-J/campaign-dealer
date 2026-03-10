<script setup lang="ts">
import {
  buildAllCharacterCombinations,
  generateCharacterTemplate,
  type CharacterTemplate,
} from "~~/shared/utils/characterRandomizer";
import type {
  CharacterArchetype,
  CharacterSuit,
} from "~~/shared/types/character";

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

const comboKey = (archetype: CharacterArchetype, suit: CharacterSuit): string =>
  `${archetype}-${suit}`;

const selected = ref<Set<string>>(new Set());
const templates = ref<Map<string, CharacterTemplate>>(new Map());
const selectionOrder = ref<string[]>([]);

watch(
  () => props.modelValue,
  (value) => {
    if (value.length > 0) {
      selected.value = new Set(value.map((t) => comboKey(t.archetype, t.suit)));
      templates.value = new Map(
        value.map((t) => [comboKey(t.archetype, t.suit), t]),
      );
      selectionOrder.value = value.map((t) => comboKey(t.archetype, t.suit));
    }
  },
  { immediate: true, once: true },
);

const partySize = computed(() => selected.value.size);
const isSelectable = computed(() => partySize.value < MAX_PARTY);

const emitOrderedTemplates = () => {
  const ordered = selectionOrder.value
    .map((k) => templates.value.get(k))
    .filter((tmpl): tmpl is CharacterTemplate => tmpl !== undefined);
  emit("update:modelValue", ordered);
};

const selectCard = (
  key: string,
  archetype: CharacterArchetype,
  suit: CharacterSuit,
) => {
  if (!isSelectable.value) return;
  const template = generateCharacterTemplate(archetype, suit);
  selected.value.add(key);
  templates.value.set(key, template);
  selectionOrder.value.push(key);
};

const deselectCard = (key: string) => {
  selected.value.delete(key);
  templates.value.delete(key);
  const idx = selectionOrder.value.indexOf(key);
  if (idx !== -1) selectionOrder.value.splice(idx, 1);
};

const toggleCard = (
  archetype: CharacterArchetype,
  suit: CharacterSuit,
  checked: boolean,
) => {
  const key = comboKey(archetype, suit);
  if (checked) selectCard(key, archetype, suit);
  else deselectCard(key);
  emitOrderedTemplates();
};

const drawRandom = () => {
  const unselected = combinations.filter(
    (c) => !selected.value.has(comboKey(c.archetype, c.suit)),
  );
  if (unselected.length === 0 || !isSelectable.value) return;
  const pick = unselected[Math.floor(Math.random() * unselected.length)]!;
  toggleCard(pick.archetype, pick.suit, true);
};

const orderedCards = computed((): (CharacterTemplate | null)[] => {
  const filled = selectionOrder.value
    .map((key) => templates.value.get(key))
    .filter((tmpl): tmpl is CharacterTemplate => tmpl !== undefined);
  const empty = Array<null>(MAX_PARTY - filled.length).fill(null);
  return [...filled, ...empty];
});
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-4">
    <CharacterSelectorList
      :combinations="combinations"
      :selected="selected"
      :can-select="isSelectable"
      @toggle="toggleCard"
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
