<script setup lang="ts">
import type { PatternName } from "~/composables/useTileTransition";

const props = withDefaults(
  defineProps<{
    cols?: number;
    rows?: number;
    pattern?: PatternName;
    duration?: number;
    spread?: number;
    tileColor?: string;
  }>(),
  {
    cols: 20,
    rows: 12,
    pattern: "diamond",
    duration: 800,
    spread: 0.6,
    tileColor: "var(--gb-shadow)",
  },
);

const { phase, coverDelays, uncoverDelays, tileDuration, cols, rows, transition } =
  useTileTransition(props);

const isActive = computed(() => phase.value !== "idle");

const activeDelays = computed(() => {
  if (phase.value === "uncovering") return uncoverDelays.value;
  return coverDelays.value;
});

const animationName = computed(() => {
  if (phase.value === "covering") return "tile-cover";
  if (phase.value === "uncovering") return "tile-uncover";
  return "none";
});

defineExpose({ transition });
</script>

<template>
  <div
    class="tile-grid-overlay"
    :class="{ 'tile-grid-active': isActive }"
    :style="{
      '--tile-cols': cols,
      '--tile-rows': rows,
    }"
    aria-hidden="true"
  >
    <div
      v-for="(delay, i) in activeDelays"
      :key="i"
      class="tile"
      :style="{
        backgroundColor: tileColor,
        animationName: animationName,
        animationDuration: tileDuration + 'ms',
        animationDelay: delay + 'ms',
        animationFillMode: 'both',
        animationTimingFunction: 'steps(1, end)',
      }"
    />
  </div>
</template>

<style scoped>
.tile-grid-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  grid-template-columns: repeat(var(--tile-cols), 1fr);
  grid-template-rows: repeat(var(--tile-rows), 1fr);
  pointer-events: none;
  visibility: hidden;
}

.tile-grid-overlay.tile-grid-active {
  visibility: visible;
  pointer-events: all;
}

.tile {
  transform: scaleY(0);
  transform-origin: top center;
  will-change: transform;
}
</style>
