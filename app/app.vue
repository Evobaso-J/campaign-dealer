<template>
  <UApp>
    <Teleport to="body">
      <!-- Teleport CRT overlays to body to ensure they render above modals -->
      <div class="crt-overlay" aria-hidden="true" />
      <div class="crt-vignette" aria-hidden="true" />
    </Teleport>

    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
