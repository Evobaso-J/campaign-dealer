<script setup lang="ts">
import { GENRE_THEMES, type ThemePreset } from "~/composables/useTheme";

const { currentPreset } = useTheme();

const presets = Object.keys(GENRE_THEMES) as ThemePreset[];
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="flex gap-1">
      <button
        v-for="preset in presets"
        :key="preset"
        :aria-pressed="currentPreset === preset"
        class="size-5 rounded-sm pixel-border transition-opacity cursor-pointer"
        :class="[
          currentPreset === preset
            ? 'opacity-100 ring-1 ring-offset-1 ring-offset-(--ui-color-primary-950) ring-(--ui-color-primary-400)'
            : 'opacity-50 hover:opacity-80',
        ]"
        :style="{
          backgroundColor: `var(--color-${preset}-500)`,
          borderColor: `var(--color-${preset}-800)`,
        }"
        @click="currentPreset = preset"
      />
    </div>
  </div>
</template>
