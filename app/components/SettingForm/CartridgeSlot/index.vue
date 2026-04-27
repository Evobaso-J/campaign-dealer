<script setup lang="ts">
import type { Genre } from "~~/shared/types/campaign";

const { t } = useI18n();

const props = defineProps<{
  genre: Genre | null;
}>();

defineEmits<{
  remove: [];
}>();

const group = computed(() => (props.genre ? getGenreGroup(props.genre) : null));
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <SettingFormCartridgeSlotFilled
      v-if="genre && group"
      :genre="genre"
      :group="group"
      @remove="$emit('remove')"
    />
    <div
      v-else
      class="max-w-48 min-h-56 w-full opacity-80 border-4 rounded-t-lg border-primary-800 border-dashed flex items-center justify-center p-2 animate-pulse"
    >
      <div
        class="flex flex-col items-center gap-8 justify-center dither-sm h-full w-full"
      >
        <UIcon name="i-pixelarticons-plus" class="text-5xl" />
        <span class="uppercase text-xs">
          {{ t("ui.setting.emptySlot") }}
        </span>
      </div>
    </div>
    <div class="flex justify-center items-center w-full max-w-48 uppercase">
      <UButton
        v-if="genre && group"
        trailing-icon="i-pixelarticons-arrow-bar-up"
        :label="t('ui.setting.eject')"
        :ui="{
          base: 'text-center tracking-widest w-full',
          label: 'inline-block mx-auto',
        }"
        color="primary"
        variant="outline"
        @click="$emit('remove')"
      />
      <div
        v-else
        class="py-1 text-center pixel-border bg-primary-400 opacity-80 animate-pulse w-full"
      >
        <span class="text-xs tracking-widest">
          {{ t("ui.setting.insertCartridge") }}
        </span>
      </div>
    </div>
  </div>
</template>
