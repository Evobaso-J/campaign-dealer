<template>
  <div class="border-8 rounded-4xl h-dvh w-dvw border-gray-600">
    <div
      class="flex flex-col flex-1 border-8 border-primary-900 rounded-3xl bg-primary-500 h-full w-full"
    >
      <header
        class="flex items-center justify-between pt-5 px-5 pb-2 border-b-3 border-primary-800 uppercase text-primary-950 shrink-0"
      >
        <span>CAMPAIGN DEALER</span>
        <ThemePicker />
      </header>

      <main class="h-full container mx-auto">
        <slot />
      </main>

      <footer
        class="flex items-center justify-between px-2 py-1 border-t-3 border-primary-800 text-xs uppercase text-primary-950 shrink-0"
      >
        <span>MEM: OK</span>
      </footer>
    </div>
  </div>
</template>
