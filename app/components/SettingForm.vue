<script setup lang="ts">
import { GenreGroups } from "~~/shared/types/campaign";
import type { Genre, GenreGroup } from "~~/shared/types/campaign";

const MAX_GENRES = 2;
const ROLL_DURATION = 1200;
const ROLL_INTERVAL = 80;
const allGroups = Object.keys(GenreGroups) as GenreGroup[];
const allGenres = Object.values(GenreGroups).flat() as Genre[];

const props = defineProps<{ modelValue: Genre[] }>();
const emit = defineEmits<{ "update:modelValue": [value: Genre[]] }>();

const slotA = ref<Genre | null>(props.modelValue[0] ?? null);
const slotB = ref<Genre | null>(props.modelValue[1] ?? null);
const isRolling = ref(false);

const selected = computed<Genre[]>(() =>
  [slotA.value, slotB.value].filter((g): g is Genre => g !== null),
);

watch([slotA, slotB], () => {
  emit("update:modelValue", selected.value);
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal.length === 0) {
      slotA.value = null;
      slotB.value = null;
    }
  },
);

const selectedGroups = computed<Set<GenreGroup>>(
  () => new Set(selected.value.map(getGenreGroup)),
);

const disabledGroups = computed<Set<GenreGroup>>(() =>
  selected.value.length >= MAX_GENRES
    ? new Set(allGroups)
    : new Set(selectedGroups.value),
);

const disabledGenreSet = computed<Set<Genre>>(() => {
  const set = new Set<Genre>(selected.value);
  for (const [group, genres] of Object.entries(GenreGroups)) {
    if (disabledGroups.value.has(group as GenreGroup)) {
      for (const g of genres) set.add(g as Genre);
    }
  }
  return set;
});

function selectGenre(genre: Genre) {
  if (slotA.value === null) {
    slotA.value = genre;
  } else {
    slotB.value = genre;
  }
}

function removeSlotA() {
  slotA.value = null;
}

function removeSlotB() {
  slotB.value = null;
}

function reroll() {
  slotA.value = null;
  slotB.value = null;
}

function pickRandomPair(): [Genre, Genre] {
  const shuffledGroups = [...allGroups].sort(() => Math.random() - 0.5);
  const groupA = shuffledGroups[0]!;
  const groupB = shuffledGroups[1]!;
  const genresA = GenreGroups[groupA];
  const genresB = GenreGroups[groupB];
  return [
    genresA[Math.floor(Math.random() * genresA.length)] as Genre,
    genresB[Math.floor(Math.random() * genresB.length)] as Genre,
  ];
}

function randomGenres() {
  if (isRolling.value) return;
  isRolling.value = true;

  const interval = setInterval(() => {
    slotA.value = allGenres[Math.floor(Math.random() * allGenres.length)]!;
    slotB.value = allGenres[Math.floor(Math.random() * allGenres.length)]!;
  }, ROLL_INTERVAL);

  setTimeout(() => {
    clearInterval(interval);
    const [a, b] = pickRandomPair();
    slotA.value = a;
    slotB.value = b;
    isRolling.value = false;
  }, ROLL_DURATION);
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col lg:flex-row gap-4">
      <div
        class="flex-1 min-w-0 relative pixel-border-thick pixel-shadow bg-primary pt-6 pb-4 px-4"
      >
        <div class="grid grid-cols-2 gap-3">
          <CartridgeSlot :genre="slotA" @remove="removeSlotA" />
          <CartridgeSlot :genre="slotB" @remove="removeSlotB" />
        </div>
      </div>

      <SidebarGenreInfo
        :selected-genres="selected"
        :is-rolling="isRolling"
        @reroll="reroll"
        @random="randomGenres"
      />
    </div>

    <GenreCarousel
      class="mx-auto"
      :disabled-groups="disabledGroups"
      :selected-genres="selected"
      :disabled-genres="disabledGenreSet"
      @select="selectGenre"
    />
  </div>
</template>
