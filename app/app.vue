<script setup lang="ts">
const { generationStatus } = useCampaignStore();
</script>

<template>
  <div>
    {{ $t("welcome") }}
    {{ generationStatus }}
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </div>
</template>
