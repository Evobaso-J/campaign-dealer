<script setup lang="ts">
import { GenreGroups } from "~~/shared/types/campaign";
import type { Genre } from "~~/shared/types/campaign";

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

function selectGenre(genre: Genre) {
  if (selected.value.includes(genre)) return;
  if (selected.value.length >= MAX_GENRES) return;
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

const comboLabel = computed(() => {
  if (selected.value.length === 0) return "";
  return selected.value.map((g) => t(`ui.setting.genres.${g}`)).join(" / ");
});
</script>

<template>
  <div class="space-y-4 overflow-hidden">
    <!-- Instruction bar -->
    <div class="terminal-panel text-center">
      <span class="text-xs text-neutral-400">
        {{ t("ui.setting.instruction") }}
      </span>
    </div>

    <!-- Cartridge slots -->
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

    <!-- Genre carousel -->
    <UCarousel
      v-slot="{ item: genre }"
      :items="allGenres"
      arrows
      :watch-drag="false"
      :slides-to-scroll="4"
      prev-icon="i-lucide-chevron-left"
      next-icon="i-lucide-chevron-right"
      :prev="{ variant: 'outline', color: 'neutral', size: 'xs' }"
      :next="{ variant: 'outline', color: 'neutral', size: 'xs' }"
      :ui="{
        root: 'w-full',
        viewport: 'mx-8',
        item: 'basis-1/4',
        container: 'gap-2 ms-0',
        prev: 'inset-s-0 top-1/2 -translate-y-1/2',
        next: 'inset-e-0 top-1/2 -translate-y-1/2',
      }"
      class="py-2"
    >
      <button
        class="w-full aspect-square pixel-border flex flex-col items-center justify-center gap-1 transition-transform hover:-translate-y-1 relative overflow-hidden"
        :class="[
          genreGroupConfig[getGenreGroup(genre)].border,
          {
            'opacity-30 cursor-default': selected.includes(genre),
            'cursor-pointer':
              !selected.includes(genre) && selected.length < MAX_GENRES,
            'opacity-50 cursor-default':
              !selected.includes(genre) && selected.length >= MAX_GENRES,
          },
        ]"
        :disabled="selected.includes(genre) || selected.length >= MAX_GENRES"
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

    <!-- Combo summary bar -->
    <div
      v-if="selected.length > 0"
      class="terminal-panel flex items-center gap-2"
    >
      <span class="crt-badge">{{ t("ui.setting.combo") }}</span>
      <span class="text-xs text-neutral-400">{{ comboLabel }}</span>
    </div>
  </div>
</template>
