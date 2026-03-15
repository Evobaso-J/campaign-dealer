<script setup lang="ts">
import type { Genre, GenreGroup } from "~~/shared/types/campaign";

const { t } = useI18n();

const props = defineProps<{
  genre: Genre;
  group: GenreGroup;
}>();

defineEmits<{
  remove: [];
}>();

const isInfoOpen = ref(false);
</script>

<template>
  <button
    class="w-full max-w-48 min-h-56 flex flex-col animate-float cursor-pointer"
    @click="isInfoOpen = true"
  >
    <div class="bg-primary-900 h-2 rounded-t-lg pixel-shadow" />
    <div
      class="bg-primary pixel-border border-primary-800 w-full max-w-48 p-1 relative pixel-shadow"
    >
      <div class="border-4 pixel-border-thick border-primary-800">
        <SettingFormGenreCartridge
          :genre="props.genre"
          :group="props.group"
          :ui="{
            base: 'size-full',
            icon: 'text-8xl',
          }"
        />
      </div>
      <div
        class="bg-primary-800 text-primary uppercase text-center flex items-center justify-center py-1"
      >
        <span class="text-xs tracking-wide truncate px-2">
          {{ t(`ui.setting.genres.${genre}`) }}
        </span>
      </div>
    </div>
  </button>

  <UModal
    v-model:open="isInfoOpen"
    :ui="{
      content: 'rounded-none border-8 border-primary-800 bg-primary ring-0',
      overlay: 'bg-primary-900/50',
    }"
    :close="{
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full',
    }"
  >
    <template #content>
      <div class="flex flex-col gap-4 p-4">
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-4">
            <div class="pixel-border-thick shrink-0">
              <SettingFormGenreCartridge
                :genre="props.genre"
                :group="props.group"
                :ui="{
                  base: 'size-14',
                  icon: 'text-3xl',
                }"
              />
            </div>
            <div class="space-y-1">
              <p class="text-lg uppercase tracking-widest text-primary-800">
                {{ t(`ui.setting.genres.${genre}`) }}
              </p>
              <span
                class="text-sm uppercase tracking-widest"
                :class="genreGroupConfig[group].text"
              >
                [{{ t(`ui.setting.groups.${group}`) }}]
              </span>
            </div>
          </div>

          <UButton
            icon="i-pixelarticons-close"
            size="xl"
            :ui="{
              base: 'p-0',
              leadingIcon: 'text-primary-800',
            }"
            variant="ghost"
            @click="isInfoOpen = false"
          />
        </div>

        <p class="text-xs leading-relaxed text-primary-800">
          {{ t(`ui.setting.genreDescriptions.${genre}`) }}
        </p>
      </div>
    </template>
  </UModal>
</template>
