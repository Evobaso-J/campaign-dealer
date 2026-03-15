<script setup lang="ts">
import type { Genre } from "~~/shared/types/campaign";

const { t } = useI18n();

defineProps<{
  selectedGenres: Genre[];
  isRolling: boolean;
}>();

defineEmits<{
  reroll: [];
  random: [];
}>();
</script>

<template>
  <div
    class="pixel-border pixel-shadow bg-primary p-4 flex flex-col gap-3 w-64 shrink-0 wrap-break-word"
  >
    <span class="text-xs tracking-widest">
      {{ t("ui.setting.selected") }}
    </span>

    <template v-if="selectedGenres.length > 0">
      <div
        v-for="(genre, idx) in selectedGenres"
        :key="idx"
        class="space-y-1 text-wrap"
      >
        <div
          v-if="idx > 0"
          class="border-t border-dashed border-neutral-600 mb-2"
        />
        <p class="text-xs font-bold">
          {{ t(`ui.setting.genres.${genre}`) }}
        </p>
        <p class="text-[0.625rem] leading-snug">
          {{ t(`ui.setting.genreDescriptions.${genre}`) }}
        </p>
      </div>
    </template>
    <p v-else class="text-[0.625rem] italic">
      {{ t("ui.setting.emptySlot") }}
    </p>

    <div class="mt-auto flex gap-2">
      <UButton
        class="flex-1"
        icon="i-pixelarticons-dice"
        size="xs"
        variant="outline"
        :disabled="isRolling"
        :label="t('ui.setting.randomRoll')"
        :ui="{
          leadingIcon: isRolling ? 'animate-spin' : '',
        }"
        @click="$emit('random')"
      />
      <UButton
        icon="i-pixelarticons-close"
        size="xs"
        variant="outline"
        :disabled="selectedGenres.length === 0 || isRolling"
        :label="t('ui.setting.clear')"
        @click="$emit('reroll')"
      />
    </div>
  </div>
</template>
