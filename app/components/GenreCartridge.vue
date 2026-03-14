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
  <div class="aspect-square" :class="genreGroupConfig[group].class">
    <UIcon
      :name="genreIcons[genre]"
      class="text-2xl z-10"
      :class="genreGroupConfig[group].icon"
    />
  </div>
</template>
