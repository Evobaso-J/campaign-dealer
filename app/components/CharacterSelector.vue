<script setup lang="ts">
import {
  allCombinations,
  generateCharacterTemplate,
  type CharacterTemplate,
} from "~~/shared/utils/characterRandomizer";
import {
  archetypeInitials,
  type CharacterArchetype,
} from "~~/shared/types/character";

const MAX_PARTY = 4;

const { t } = useI18n();

const emit = defineEmits<{
  "update:modelValue": [value: CharacterTemplate[]];
}>();

defineProps<{
  modelValue: CharacterTemplate[];
}>();

const suitIcons: Record<string, string> = {
  hearts: "\u2665",
  clubs: "\u2663",
  spades: "\u2660",
};

const cardRotations = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

const combinations = allCombinations();

const selected = ref<Set<string>>(new Set());
const templates = ref<Map<string, CharacterTemplate>>(new Map());
const selectionOrder = ref<string[]>([]);

const partySize = computed(() => selected.value.size);
const canSelect = computed(() => partySize.value < MAX_PARTY);
const canLock = computed(() => partySize.value > 0);

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
}

function drawRandom() {
  const unselected = combinations.filter(
    (c) => !selected.value.has(comboKey(c.archetype, c.suit)),
  );
  if (unselected.length === 0 || !canSelect.value) return;
  const pick = unselected[Math.floor(Math.random() * unselected.length)]!;
  toggleCombo(pick.archetype, pick.suit, true);
}

function lockParty() {
  const ordered = selectionOrder.value
    .map((key) => templates.value.get(key))
    .filter((t): t is CharacterTemplate => t !== undefined);
  emit("update:modelValue", ordered);
}

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
    <!-- Left panel: flat character list -->
    <div
      class="lg:w-1/4 w-full pixel-border-thick pixel-shadow bg-primary-400/10 p-3 flex flex-col"
    >
      <span class="section-header text-xs mb-3 font-pixel">
        {{ t("ui.selector.selectFighter").toUpperCase() }}
      </span>

      <div role="list" class="overflow-y-auto max-h-80 space-y-1">
        <button
          v-for="combo in combinations"
          :key="comboKey(combo.archetype, combo.suit)"
          role="listitem"
          class="w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors"
          :class="{
            'bg-primary-300/20 pixel-border': selected.has(
              comboKey(combo.archetype, combo.suit),
            ),
            'opacity-50 cursor-not-allowed':
              !canSelect &&
              !selected.has(comboKey(combo.archetype, combo.suit)),
            'hover:bg-primary-400/10 cursor-pointer':
              canSelect || selected.has(comboKey(combo.archetype, combo.suit)),
          }"
          :aria-label="`${t(`ui.selector.archetype.${combo.archetype}`)} of ${combo.suit}`"
          :aria-pressed="selected.has(comboKey(combo.archetype, combo.suit))"
          :disabled="
            !canSelect && !selected.has(comboKey(combo.archetype, combo.suit))
          "
          @click="
            toggleCombo(
              combo.archetype,
              combo.suit,
              !selected.has(comboKey(combo.archetype, combo.suit)),
            )
          "
        >
          <!-- Mini card icon (decorative, described by aria-label) -->
          <span
            aria-hidden="true"
            class="w-7 h-9 pixel-border flex flex-col items-center justify-center text-[0.5rem] leading-tight shrink-0"
            :class="
              selected.has(comboKey(combo.archetype, combo.suit))
                ? 'bg-primary-400/30'
                : 'bg-primary-950/40'
            "
          >
            <span class="font-pixel">{{
              archetypeInitials[combo.archetype]
            }}</span>
            <span>{{ suitIcons[combo.suit] }}</span>
          </span>

          <span
            aria-hidden="true"
            class="text-xs uppercase tracking-wider truncate"
          >
            {{ t(`ui.selector.archetype.${combo.archetype}`) }}
            {{ suitIcons[combo.suit] }}
          </span>
        </button>
      </div>
    </div>

    <!-- Right panel: card arena -->
    <div
      class="lg:w-3/4 w-full pixel-border-thick pixel-shadow bg-primary-400/10 p-3 flex flex-col gap-3"
    >
      <!-- Arena area -->
      <div
        class="border-2 border-primary-900 bg-primary-500/10 p-4 min-h-52 flex items-center justify-center [background-image:linear-gradient(var(--ui-color-primary-800)_1px,transparent_1px),linear-gradient(90deg,var(--ui-color-primary-800)_1px,transparent_1px)] [background-size:20px_20px]"
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
          class="text-xs text-primary-800 tracking-wider font-pixel"
        >
          {{ t("ui.selector.lineUp").toUpperCase() }}: {{ partySize }} /
          {{ MAX_PARTY }}
          {{ t("ui.selector.fighter").toUpperCase() }}
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
          <UButton size="xs" :disabled="!canLock" @click="lockParty">
            {{ t("ui.selector.lockParty") }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
