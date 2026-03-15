<script setup lang="ts">
import { GenreGroups } from "~~/shared/types/campaign";
import type { Genre, GenreGroup } from "~~/shared/types/campaign";

const { t } = useI18n();

const props = defineProps<{
  disabledGroups: Set<GenreGroup>;
  selectedGenres: Genre[];
  disabledGenres: Set<Genre>;
}>();

const emit = defineEmits<{ select: [genre: Genre] }>();

const groupEntries = Object.entries(GenreGroups) as [
  GenreGroup,
  readonly Genre[],
][];

const currentGroupIndex = ref(0);

function scrollCarousel(direction: "left" | "right") {
  if (direction === "left" && currentGroupIndex.value > 0) {
    currentGroupIndex.value--;
  } else if (
    direction === "right" &&
    currentGroupIndex.value < groupEntries.length - 1
  ) {
    currentGroupIndex.value++;
  }
}

function selectGenre(genre: Genre) {
  if (props.disabledGenres.has(genre)) return;
  emit("select", genre);
}
</script>

<template>
  <div class="flex items-center gap-4 w-fit">
    <UButton
      icon="i-pixelarticons-chevron-left"
      variant="outline"
      color="primary"
      class="shrink-0 pixel-border-thick pixel-shadow"
      :class="{ invisible: currentGroupIndex === 0 }"
      @click="scrollCarousel('left')"
    />

    <div class="py-2 w-min">
      <div
        v-for="([group, genres], idx) in groupEntries"
        v-show="idx === currentGroupIndex"
        :key="group"
        class="flex flex-col items-center transition-opacity p-2"
        :class="[
          disabledGroups.has(group) ? 'opacity-30' : '',
          genreGroupConfig[group].border,
        ]"
      >
        <div
          class="text-sm tracking-widest uppercase self-start bg-primary-800 p-1 text-primary"
        >
          <span>{{ t(`ui.setting.groups.${group}`) }}</span>
        </div>
        <div class="flex gap-2 justify-center pixel-border-thick p-2 w-full">
          <button
            v-for="genre in genres"
            :key="genre"
            class="shrink-0 w-full max-w-24 flex flex-col items-center gap-1 transition-transform hover:-translate-y-1"
            :class="{
              'opacity-30 cursor-default': selectedGenres.includes(genre),
              'cursor-pointer': !disabledGenres.has(genre),
              'cursor-default': disabledGenres.has(genre),
            }"
            :disabled="disabledGenres.has(genre)"
            @click="selectGenre(genre)"
          >
            <div class="bg-primary pixel-border border-primary-800">
              <SettingFormGenreCartridge
                :genre="genre"
                :group="group"
                :ui="{
                  base: 'size-24',
                  icon: 'text-5xl',
                }"
              />
              <div
                class="bg-primary-800 text-primary uppercase text-center flex items-center justify-center py-1 max-w-24"
              >
                <span class="text-[0.4rem] tracking-wide truncate px-2">
                  {{ t(`ui.setting.genres.${genre}`) }}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <UButton
      icon="i-pixelarticons-chevron-right"
      variant="outline"
      color="primary"
      class="shrink-0 pixel-border-thick pixel-shadow"
      :class="{ invisible: currentGroupIndex >= groupEntries.length - 1 }"
      @click="scrollCarousel('right')"
    />
  </div>
</template>
