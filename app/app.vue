<script setup lang="ts">
import { useTheme } from "./composables/useTheme";

useTheme();
</script>

<template>
  <UApp>
    <div class="crt-overlay" aria-hidden="true" />
    <div class="crt-vignette" aria-hidden="true" />
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </UApp>
</template>
