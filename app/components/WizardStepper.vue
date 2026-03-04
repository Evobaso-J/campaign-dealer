<script setup lang="ts">
import { GenreGroups } from "~~/shared/types/campaign";
import type { Genre, GenreGroup } from "~~/shared/types/campaign";

const { t } = useI18n();
const store = useCampaignStore();
const { generateCharacters, generateScript } = useCampaign();

const currentStep = ref(1);
const playerCount = ref(2);
const selectedGenres = ref<Genre[]>([]);

const stepTitles = computed(() => [
  t("ui.wizard.step1Title"),
  t("ui.wizard.step2Title"),
  t("ui.wizard.step3Title"),
  t("ui.wizard.step4Title"),
]);

const canGoNext = computed(() => {
  if (store.isLoading) return false;
  if (currentStep.value === 2) return selectedGenres.value.length > 0;
  if (currentStep.value === 3)
    return store.characters.length > 0 && !store.isLoading;
  return currentStep.value < 4;
});

function toggleGenre(genre: Genre, checked: boolean) {
  if (checked) {
    selectedGenres.value.push(genre);
  } else {
    const idx = selectedGenres.value.indexOf(genre);
    if (idx !== -1) selectedGenres.value.splice(idx, 1);
  }
}

async function goNext() {
  if (!canGoNext.value) return;

  if (currentStep.value === 2) {
    currentStep.value = 3;
    await generateCharacters(playerCount.value, selectedGenres.value);
    return;
  }

  if (currentStep.value === 3) {
    currentStep.value = 4;
    await generateScript(selectedGenres.value);
    return;
  }

  currentStep.value++;
}

function goBack() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Step indicator -->
    <div class="flex items-center gap-2">
      <template v-for="(title, i) in stepTitles" :key="i">
        <div
          class="flex items-center gap-1.5 text-sm"
          :class="
            currentStep === i + 1
              ? 'text-primary font-semibold'
              : currentStep > i + 1
                ? 'text-neutral-500'
                : 'text-neutral-400'
          "
        >
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0"
            :class="
              currentStep > i + 1
                ? 'bg-primary/10 text-primary'
                : currentStep === i + 1
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
            "
          >
            <UIcon
              v-if="currentStep > i + 1"
              name="i-lucide-check"
              class="size-3.5"
            />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="hidden sm:inline">{{ title }}</span>
        </div>
        <div
          v-if="i < stepTitles.length - 1"
          class="flex-1 h-px bg-neutral-200 dark:bg-neutral-700"
        />
      </template>
    </div>

    <!-- Error alert -->
    <UAlert
      v-if="store.errorMessage"
      color="error"
      icon="i-lucide-circle-x"
      :title="t('ui.status.error')"
      :description="store.errorMessage"
    />

    <!-- Step content -->
    <div>
      <!-- Step 1: Player count (inline placeholder for PlayerCountInput) -->
      <div v-if="currentStep === 1">
        <UFormField :label="t('ui.playerCount.label')">
          <UInputNumber v-model="playerCount" :min="1" :max="6" class="w-32" />
          <template #hint>
            {{ t("ui.playerCount.hint") }}
          </template>
        </UFormField>
      </div>

      <!-- Step 2: Setting (inline placeholder for SettingForm) -->
      <div v-else-if="currentStep === 2" class="space-y-4">
        <p class="text-sm font-medium">{{ t("ui.setting.label") }}</p>
        <div
          v-for="(genres, group) in GenreGroups"
          :key="group"
          class="space-y-2"
        >
          <p class="text-xs font-semibold uppercase text-neutral-500">
            {{ t(`ui.setting.groups.${group as GenreGroup}`) }}
          </p>
          <div class="flex flex-wrap gap-3">
            <UCheckbox
              v-for="genre in genres"
              :key="genre"
              :model-value="selectedGenres.includes(genre)"
              :label="genre"
              @update:model-value="
                (checked: boolean | 'indeterminate') =>
                  toggleGenre(genre, checked === true)
              "
            />
          </div>
        </div>
      </div>

      <!-- Step 3: Characters (placeholder for CharacterGrid) -->
      <div v-else-if="currentStep === 3" class="space-y-4">
        <div
          v-if="store.generationStatus === 'generating-characters'"
          class="flex items-center gap-2 text-neutral-500"
        >
          <UIcon name="i-lucide-loader-circle" class="animate-spin" />
          <span>{{ t("ui.status.generating") }}</span>
        </div>
        <p
          v-else-if="store.characters.length"
          class="text-neutral-500 italic p-4 border border-dashed rounded-lg text-center"
        >
          [CharacterGrid placeholder — {{ store.characters.length }} characters
          generated]
        </p>
      </div>

      <!-- Step 4: GM Script (placeholder for GmScript) -->
      <div v-else-if="currentStep === 4" class="space-y-4">
        <div
          v-if="store.generationStatus === 'generating-script'"
          class="flex items-center gap-2 text-neutral-500"
        >
          <UIcon name="i-lucide-loader-circle" class="animate-spin" />
          <span>{{ t("ui.status.generating") }}</span>
        </div>
        <p
          v-else-if="store.gmScript"
          class="text-neutral-500 italic p-4 border border-dashed rounded-lg text-center"
        >
          [GmScript placeholder — campaign script generated]
        </p>
      </div>
    </div>

    <!-- Navigation buttons -->
    <div class="flex items-center justify-between">
      <UButton
        v-if="currentStep > 1"
        variant="outline"
        color="neutral"
        :disabled="store.isLoading"
        @click="goBack"
      >
        {{ t("ui.wizard.back") }}
      </UButton>
      <div v-else />

      <UButton
        v-if="currentStep < 4"
        :disabled="!canGoNext"
        :loading="store.isLoading"
        @click="goNext"
      >
        {{
          currentStep === 2
            ? t("ui.wizard.generate")
            : currentStep === 3
              ? t("ui.wizard.generateScript")
              : t("ui.wizard.next")
        }}
      </UButton>
    </div>
  </div>
</template>
