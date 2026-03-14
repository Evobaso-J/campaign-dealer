<script setup lang="ts">
import type { Genre, GenreGroup } from "~~/shared/types/campaign";

defineProps<{
  genre: Genre;
  group: GenreGroup;
}>();

defineEmits<{
  remove: [];
}>();
</script>

<template>
  <div class="aspect-square relative" :class="genreGroupConfig[group].class">
    <UIcon
      :name="genreIcons[genre]"
      class="text-8xl z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      :class="genreGroupConfig[group].icon"
    />
  </div>
</template>
