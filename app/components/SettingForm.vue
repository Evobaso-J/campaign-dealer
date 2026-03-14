<script setup lang="ts">
import { GenreGroups } from "~~/shared/types/campaign";
import type { Genre, GenreGroup } from "~~/shared/types/campaign";

const MAX_GENRES = 2;

const { t } = useI18n();

const props = defineProps<{ modelValue: Genre[] }>();
const emit = defineEmits<{ "update:modelValue": [value: Genre[]] }>();

const slotA = ref<Genre | null>(props.modelValue[0] ?? null);
const slotB = ref<Genre | null>(props.modelValue[1] ?? null);

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

const allGenres = Object.values(GenreGroups).flat() as Genre[];

const selectedGroups = computed<Set<GenreGroup>>(() => {
  const groups = new Set<GenreGroup>();
  for (const genre of selected.value) {
    groups.add(getGenreGroup(genre));
  }
  return groups;
});

function isGenreDisabled(genre: Genre): boolean {
  if (selected.value.includes(genre)) return true;
  if (selected.value.length >= MAX_GENRES) return true;
  return selectedGroups.value.has(getGenreGroup(genre));
}

function selectGenre(genre: Genre) {
  if (isGenreDisabled(genre)) return;
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

// Carousel scroll
const scrollContainer = ref<HTMLElement | null>(null);

function scrollCarousel(direction: "left" | "right") {
  if (!scrollContainer.value) return;
  const amount = 200;
  scrollContainer.value.scrollBy({
    left: direction === "left" ? -amount : amount,
    behavior: "smooth",
  });
}
</script>

<template>
  <div class="space-y-4">
    <!-- Console dock panel -->
    <div
      class="relative pixel-border-thick pixel-shadow bg-primary pt-6 pb-4 px-4"
    >
      <!-- Top connector bar -->
      <div
        class="absolute top-0 left-4 right-4 h-3 bg-primary-800 flex justify-around"
      >
        <div class="w-20 h-1.5 bg-primary" />
        <div class="w-20 h-1.5 bg-primary" />
        <div class="w-20 h-1.5 bg-primary" />
      </div>

      <!-- Cartridge slots -->
      <div class="grid grid-cols-2 gap-3">
        <CartridgeSlot :genre="slotA" @remove="removeSlotA" />
        <CartridgeSlot :genre="slotB" @remove="removeSlotB" />
      </div>
    </div>

    <!-- Custom carousel -->
    <div class="flex items-center gap-1">
      <!-- Left arrow -->
      <button
        class="shrink-0 w-8 h-8 pixel-border flex items-center justify-center hover:bg-primary-900 transition-colors"
        @click="scrollCarousel('left')"
      >
        <UIcon name="i-pixelarticons-chevron-left" class="text-lg" />
      </button>

      <!-- Scrollable genre strip -->
      <div
        ref="scrollContainer"
        class="flex gap-2 overflow-x-auto scrollbar-none py-2 px-1"
      >
        <button
          v-for="genre in allGenres"
          :key="genre"
          class="shrink-0 w-24 flex flex-col items-center gap-1 transition-transform hover:-translate-y-1"
          :class="{
            'opacity-30 cursor-default': selected.includes(genre),
            'cursor-pointer': !isGenreDisabled(genre),
            'opacity-50 cursor-default':
              !selected.includes(genre) && isGenreDisabled(genre),
          }"
          :disabled="isGenreDisabled(genre)"
          @click="selectGenre(genre)"
        >
          <GenreCartridge :genre="genre" :group="getGenreGroup(genre)" />
          <span class="text-[0.4rem] text-center leading-tight px-1">
            {{ t(`ui.setting.genres.${genre}`) }}
          </span>
        </button>
      </div>

      <!-- Right arrow -->
      <button
        class="shrink-0 w-8 h-8 pixel-border flex items-center justify-center hover:bg-primary-900 transition-colors"
        @click="scrollCarousel('right')"
      >
        <UIcon name="i-pixelarticons-chevron-right" class="text-lg" />
      </button>
    </div>

    <!-- Combo summary panel -->
    <div
      v-if="selected.length > 0"
      class="terminal-panel flex items-center justify-between gap-3"
    >
      <div class="flex-1 min-w-0">
        <span class="text-[0.5rem] text-neutral-500 tracking-widest">
          {{ t("ui.setting.combo") }}
        </span>
        <div class="text-xs mt-1 truncate">
          <template v-if="slotA">
            {{ t(`ui.setting.genres.${slotA}`) }}
          </template>
          <template v-if="slotA && slotB"> / </template>
          <template v-if="slotB">
            {{ t(`ui.setting.genres.${slotB}`) }}
          </template>
        </div>
      </div>
      <button
        class="shrink-0 w-8 h-8 rounded-full pixel-border flex items-center justify-center hover:bg-primary-900 transition-colors"
        :title="t('ui.wizard.reroll')"
        @click="reroll"
      >
        <UIcon name="i-pixelarticons-redo" class="text-sm" />
      </button>
    </div>
  </div>
</template>
