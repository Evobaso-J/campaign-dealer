<script setup lang="ts">
const { generationStatus } = useCampaignStore();
</script>

<template>
  <UApp>
    {{ generationStatus }}
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </UApp>
</template>
