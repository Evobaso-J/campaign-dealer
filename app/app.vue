<script setup lang="ts">
const { generationStatus } = useCampaignStore();
</script>

<template>
  <div>
    {{ generationStatus }}
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
