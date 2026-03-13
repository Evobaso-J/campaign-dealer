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
  <div class="space-y-1 flex flex-col items-center">
    <span class="text-xs tracking-widest text-neutral-500">
      {{ label }}
    </span>
    <div
      v-if="genre && group"
      class="max-w-48 w-full aspect-square mx-auto pixel-border flex flex-col items-center justify-center gap-2 relative overflow-hidden"
      :class="genreGroupConfig[group].border"
    >
      <UButton
        icon="i-pixelarticons-close"
        size="xs"
        variant="outline"
        color="neutral"
        class="absolute top-1 right-1 z-20"
        @click="$emit('remove')"
      />
      <div
        class="absolute inset-0 opacity-30"
        :class="genreGroupConfig[group].dither"
      />
      <UIcon
        :name="genreIcons[genre]"
        class="text-2xl relative z-10"
        :class="genreGroupConfig[group].icon"
      />
      <span class="crt-badge relative z-10">
        {{ t(`ui.setting.genres.${genre}`) }}
      </span>
    </div>
    <div
      v-else
      class="max-w-48 w-full aspect-square mx-auto bg-neutral-900 pixel-border border-dashed flex items-center justify-center"
    >
      <span class="text-neutral-600">
        {{ t("ui.setting.empty") }}
      </span>
    </div>
  </div>
</template>
