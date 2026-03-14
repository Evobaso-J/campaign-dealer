<script setup lang="ts">
import type { Genre, GenreGroup } from "~~/shared/types/campaign";

withDefaults(
  defineProps<{
    genre: Genre;
    group: GenreGroup;
    ui?: {
      base?: string;
      icon?: string;
    };
  }>(),
  {
    ui: () => ({
      base: "size-12",
      icon: "text-2xl",
    }),
  },
);

defineEmits<{
  remove: [];
}>();
</script>

<template>
  <div
    class="aspect-square relative"
    :class="[genreGroupConfig[group].class, ui?.base]"
  >
    <UIcon
      :name="genreIcons[genre]"
      class="z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      :class="[genreGroupConfig[group].icon, ui?.icon]"
    />
  </div>
</template>
