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
</script>

<template>
  <div class="space-y-4">
    <div class="terminal-panel text-center">
      <span class="text-xs text-neutral-400">
        {{ t("ui.setting.instruction") }}
      </span>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <CartridgeSlot
        :genre="slotA"
        :label="t('ui.setting.inputA')"
        @remove="removeSlotA"
      />
      <CartridgeSlot
        :genre="slotB"
        :label="t('ui.setting.inputB')"
        @remove="removeSlotB"
      />
    </div>

    <UCarousel
      v-slot="{ item: genre }"
      :items="allGenres"
      arrows
      :watch-drag="false"
      :slides-to-scroll="4"
      align="center"
      prev-icon="i-pixelarticons-chevron-left"
      next-icon="i-pixelarticons-chevron-right"
      :prev="{ variant: 'outline', size: 'lg' }"
      :next="{ variant: 'outline', size: 'lg' }"
      :ui="{
        root: 'w-full',
        viewport: 'mx-8',
        item: 'basis-1/4',
        container: 'ms-0 py-2',
        prev: 'inset-s-0',
        next: 'inset-e-0',
      }"
      class="py-2"
    >
      <button
        class="w-32 aspect-square pixel-border flex flex-col items-center justify-center gap-1 transition-transform hover:-translate-y-1 relative overflow-hidden"
        :class="[
          genreGroupConfig[getGenreGroup(genre)].border,
          {
            'opacity-30 cursor-default': selected.includes(genre),
            'cursor-pointer': !isGenreDisabled(genre),
            'opacity-50 cursor-default':
              !selected.includes(genre) && isGenreDisabled(genre),
          },
        ]"
        :disabled="isGenreDisabled(genre)"
        @click="selectGenre(genre)"
      >
        <div
          class="absolute inset-0 opacity-20"
          :class="genreGroupConfig[getGenreGroup(genre)].dither"
        />
        <UIcon
          :name="genreIcons[genre]"
          class="text-lg relative z-10"
          :class="genreGroupConfig[getGenreGroup(genre)].icon"
        />
        <span
          class="text-[0.4rem] text-center leading-tight relative z-10 px-1"
        >
          {{ t(`ui.setting.genres.${genre}`) }}
        </span>
      </button>
    </UCarousel>
  </div>
</template>
