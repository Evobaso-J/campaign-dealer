<script setup lang="ts">
import { GenreGroups } from "~~/shared/types/campaign";
import type { Genre, GenreGroup } from "~~/shared/types/campaign";

const MAX_GENRES = 2;
const allGroups = Object.keys(GenreGroups) as GenreGroup[];

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
</script>

<template>
  <div class="space-y-4">
    <!-- Console dock panel -->
    <div
      class="relative pixel-border-thick pixel-shadow bg-primary pt-6 pb-4 px-4"
    >
      <div class="grid grid-cols-2 gap-3">
        <CartridgeSlot :genre="slotA" @remove="removeSlotA" />
        <CartridgeSlot :genre="slotB" @remove="removeSlotB" />
      </div>
    </div>

    <!-- Genre carousel -->
    <GenreCarousel
      :disabled-groups="disabledGroups"
      :selected-genres="selected"
      :disabled-genres="disabledGenreSet"
      @select="selectGenre"
    />

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
