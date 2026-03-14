<script setup lang="ts">
import type { Genre } from "~~/shared/types/campaign";

const { t } = useI18n();

const props = defineProps<{
  genre: Genre | null;
}>();

defineEmits<{
  remove: [];
}>();

const group = computed(() => (props.genre ? getGenreGroup(props.genre) : null));
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <div
      v-if="genre && group"
      class="w-full max-w-48 min-h-56 flex flex-col animate-float"
    >
      <div class="bg-primary-900 h-2 rounded-t-lg pixel-shadow" />
      <div
        class="bg-primary pixel-border border-primary-800 w-full max-w-48 p-1 relative pixel-shadow"
      >
        <div
          class="border-4 border-dashed [border-bottom-style:solid] pixel-border-thick border-primary-800"
        >
          <GenreCartridge
            :genre="genre"
            :group="group"
            @remove="$emit('remove')"
          />
        </div>
        <div
          class="bg-primary-800 text-primary uppercase text-center flex items-center justify-center py-1"
        >
          <span class="text-xs tracking-wide truncate px-2">
            {{ t(`ui.setting.genres.${genre}`) }}
          </span>
        </div>
      </div>
    </div>
    <div
      v-else
      class="max-w-48 min-h-56 w-full opacity-80 border-4 rounded-t-lg border-primary-800 border-dashed flex items-center justify-center p-2 animate-pulse"
    >
      <div
        class="flex flex-col items-center gap-8 justify-center text-primary-800 dither-sm h-full w-full"
      >
        <UIcon name="i-pixelarticons-plus" class="text-5xl" />
        <span class="uppercase text-xs">
          {{ t("ui.setting.emptySlot") }}
        </span>
      </div>
    </div>
    <div class="flex justify-center items-center w-full max-w-48 uppercase">
      <UButton
        v-if="genre && group"
        trailing-icon="i-pixelarticons-arrow-bar-up"
        :label="t('ui.setting.eject')"
        :ui="{
          base: 'text-center text-primary-800 tracking-widest w-full',
          label: 'inline-block mx-auto',
        }"
        color="primary"
        variant="outline"
        @click="$emit('remove')"
      />
      <div
        v-else
        class="py-1 text-center pixel-border text-primary-800 bg-primary-400 opacity-80 animate-pulse w-full"
      >
        <span class="text-xs tracking-widest">
          {{ t("ui.setting.insertCartridge") }}
        </span>
      </div>
    </div>
  </div>
</template>
