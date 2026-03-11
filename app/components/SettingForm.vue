<script setup lang="ts">
import { GenreGroups } from "~~/shared/types/campaign";
import type { Genre, GenreGroup } from "~~/shared/types/campaign";

const MAX_GENRES = 2;

const { t } = useI18n();

const emit = defineEmits<{
  "update:modelValue": [value: Genre[]];
}>();

const props = defineProps<{
  modelValue: Genre[];
}>();

const genreIcons: Record<Genre, string> = {
  highFantasy: "i-lucide-swords",
  darkFantasy: "i-lucide-skull",
  swordAndSorcery: "i-lucide-sword",
  mythicFantasy: "i-lucide-crown",
  cyberpunk: "i-lucide-cpu",
  spaceOpera: "i-lucide-rocket",
  hardScifi: "i-lucide-atom",
  postApocalyptic: "i-lucide-radiation",
  cosmicHorror: "i-lucide-eye",
  gothicHorror: "i-lucide-castle",
  survivalHorror: "i-lucide-heart-pulse",
  folkHorror: "i-lucide-trees",
  urbanFantasy: "i-lucide-building",
  superhero: "i-lucide-zap",
  conspiracy: "i-lucide-search",
  weirdWest: "i-lucide-crosshair",
  wuxia: "i-lucide-wind",
  isekai: "i-lucide-door-open",
  chanbara: "i-lucide-fan",
  steampunk: "i-lucide-cog",
};

const genrePatterns: Record<GenreGroup, { class: string; color: string }> = {
  fantasy: { class: "dither-sm", color: "var(--color-fantasy-400)" },
  scifi: { class: "dither-md", color: "var(--color-scifi-400)" },
  horror: { class: "dither-lg", color: "var(--color-horror-400)" },
  modern: { class: "dither-sm", color: "var(--color-modern-400)" },
  cultural: { class: "dither-md", color: "var(--color-cultural-400)" },
};

const genreBorderColors: Record<GenreGroup, string> = {
  fantasy: "var(--color-fantasy-500)",
  scifi: "var(--color-scifi-500)",
  horror: "var(--color-horror-500)",
  modern: "var(--color-modern-500)",
  cultural: "var(--color-cultural-500)",
};

function getGenreGroup(genre: Genre): GenreGroup {
  for (const [group, genres] of Object.entries(GenreGroups)) {
    if ((genres as readonly string[]).includes(genre)) {
      return group as GenreGroup;
    }
  }
  return "fantasy";
}

const allGenres = Object.values(GenreGroups).flat() as Genre[];

const selected = computed(() => props.modelValue);
const slotA = computed(() => selected.value[0] ?? null);
const slotB = computed(() => selected.value[1] ?? null);

function selectGenre(genre: Genre) {
  if (selected.value.includes(genre)) return;
  if (selected.value.length >= MAX_GENRES) return;
  emit("update:modelValue", [...selected.value, genre]);
}

function removeGenre(index: number) {
  const next = selected.value.filter((_, i) => i !== index);
  emit("update:modelValue", next);
}

const carouselRef = ref<HTMLElement | null>(null);

function scrollCarousel(direction: "left" | "right") {
  if (!carouselRef.value) return;
  const amount = 200;
  carouselRef.value.scrollBy({
    left: direction === "left" ? -amount : amount,
    behavior: "smooth",
  });
}

const comboLabel = computed(() => {
  if (selected.value.length === 0) return "";
  return selected.value.map((g) => t(`ui.setting.genres.${g}`)).join(" / ");
});
</script>

<template>
  <div class="space-y-4">
    <!-- Instruction bar -->
    <div class="terminal-panel text-center">
      <span class="text-xs text-neutral-400">
        {{ t("ui.setting.instruction") }}
      </span>
    </div>

    <!-- Cartridge slots -->
    <div class="grid grid-cols-2 gap-3">
      <!-- INPUT A -->
      <div class="space-y-1">
        <span class="text-[0.6rem] tracking-widest text-neutral-500">
          {{ t("ui.setting.inputA") }}
        </span>
        <button
          v-if="slotA"
          class="w-full aspect-[3/4] pixel-border flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] relative overflow-hidden"
          :style="{ borderColor: genreBorderColors[getGenreGroup(slotA)] }"
          @click="removeGenre(0)"
        >
          <div
            class="absolute inset-0 opacity-30"
            :class="genrePatterns[getGenreGroup(slotA)].class"
            :style="{
              '--dither-color': genrePatterns[getGenreGroup(slotA)].color,
            }"
          />
          <UIcon
            :name="genreIcons[slotA]"
            class="text-2xl relative z-10"
            :style="{ color: genrePatterns[getGenreGroup(slotA)].color }"
          />
          <span class="crt-badge relative z-10 text-[0.5rem]">
            {{ t(`ui.setting.genres.${slotA}`) }}
          </span>
        </button>
        <div
          v-else
          class="w-full aspect-[3/4] bg-neutral-900 pixel-border border-dashed flex items-center justify-center"
        >
          <span class="text-[0.5rem] text-neutral-600">
            {{ t("ui.setting.empty") }}
          </span>
        </div>
      </div>

      <!-- INPUT B -->
      <div class="space-y-1">
        <span class="text-[0.6rem] tracking-widest text-neutral-500">
          {{ t("ui.setting.inputB") }}
        </span>
        <button
          v-if="slotB"
          class="w-full aspect-[3/4] pixel-border flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] relative overflow-hidden"
          :style="{ borderColor: genreBorderColors[getGenreGroup(slotB)] }"
          @click="removeGenre(1)"
        >
          <div
            class="absolute inset-0 opacity-30"
            :class="genrePatterns[getGenreGroup(slotB)].class"
            :style="{
              '--dither-color': genrePatterns[getGenreGroup(slotB)].color,
            }"
          />
          <UIcon
            :name="genreIcons[slotB]"
            class="text-2xl relative z-10"
            :style="{ color: genrePatterns[getGenreGroup(slotB)].color }"
          />
          <span class="crt-badge relative z-10 text-[0.5rem]">
            {{ t(`ui.setting.genres.${slotB}`) }}
          </span>
        </button>
        <div
          v-else
          class="w-full aspect-[3/4] bg-neutral-900 pixel-border border-dashed flex items-center justify-center"
        >
          <span class="text-[0.5rem] text-neutral-600">
            {{ t("ui.setting.empty") }}
          </span>
        </div>
      </div>
    </div>

    <!-- Genre carousel -->
    <div class="flex items-center gap-2">
      <UButton
        variant="outline"
        color="neutral"
        size="xs"
        icon="i-lucide-chevron-left"
        @click="scrollCarousel('left')"
      />

      <div
        ref="carouselRef"
        class="flex-1 overflow-x-auto flex gap-2 py-2 scrollbar-hide"
      >
        <button
          v-for="genre in allGenres"
          :key="genre"
          class="flex-shrink-0 w-20 aspect-[3/4] pixel-border flex flex-col items-center justify-center gap-1 transition-transform hover:-translate-y-1 relative overflow-hidden"
          :class="{
            'opacity-30 cursor-default': selected.includes(genre),
            'cursor-pointer':
              !selected.includes(genre) && selected.length < MAX_GENRES,
            'opacity-50 cursor-default':
              !selected.includes(genre) && selected.length >= MAX_GENRES,
          }"
          :style="{ borderColor: genreBorderColors[getGenreGroup(genre)] }"
          :disabled="selected.includes(genre) || selected.length >= MAX_GENRES"
          @click="selectGenre(genre)"
        >
          <div
            class="absolute inset-0 opacity-20"
            :class="genrePatterns[getGenreGroup(genre)].class"
            :style="{
              '--dither-color': genrePatterns[getGenreGroup(genre)].color,
            }"
          />
          <UIcon
            :name="genreIcons[genre]"
            class="text-lg relative z-10"
            :style="{ color: genrePatterns[getGenreGroup(genre)].color }"
          />
          <span
            class="text-[0.4rem] text-center leading-tight relative z-10 px-1"
          >
            {{ t(`ui.setting.genres.${genre}`) }}
          </span>
        </button>
      </div>

      <UButton
        variant="outline"
        color="neutral"
        size="xs"
        icon="i-lucide-chevron-right"
        @click="scrollCarousel('right')"
      />
    </div>

    <!-- Combo summary bar -->
    <div
      v-if="selected.length > 0"
      class="terminal-panel flex items-center gap-2"
    >
      <span class="crt-badge">{{ t("ui.setting.combo") }}</span>
      <span class="text-xs text-neutral-400">{{ comboLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
