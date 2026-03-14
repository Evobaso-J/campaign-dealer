<script setup lang="ts">
import type { Genre } from "~~/shared/types/campaign";

const { t } = useI18n();

const props = defineProps<{
  genre: Genre | null;
  label: string;
}>();

defineEmits<{
  remove: [];
}>();

const group = computed(() => (props.genre ? getGenreGroup(props.genre) : null));
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <div v-if="genre && group" class="w-full max-w-48 min-h-56 flex flex-col">
      <div class="bg-primary-900 h-2 rounded-t-lg" />
      <div
        class="bg-primary pixel-border border-primary-800 w-full max-w-48 p-1 relative pixel-shadow"
      >
        <div
          class="border-4 border-dashed [border-bottom-style:solid] pixel-border-thick border-primary-800"
        >
          <UButton
            icon="i-pixelarticons-close"
            size="xs"
            variant="outline"
            color="neutral"
            class="absolute top-1 right-1 z-20"
            @click="$emit('remove')"
          />
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
    <div
      class="w-full max-w-48 py-1 text-center uppercase pixel-shadow pixel-border-thick bg-primary-400"
      :class="{
        'opacity-80 animate-pulse': !(genre && group),
      }"
    >
      <span class="text-xs tracking-widest">
        {{ label }}
      </span>
    </div>
  </div>
</template>
