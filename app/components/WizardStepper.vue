<script setup lang="ts">
import { GenreGroups } from "~~/shared/types/campaign";
import type { Genre } from "~~/shared/types/campaign";

const { t } = useI18n();
const store = useCampaignStore();
const { generateCharacters, generateScript } = useCampaign();

const stepKeys = ["playerCount", "setting", "characters", "script"] as const;
type StepKey = (typeof stepKeys)[number];

const steps: Record<StepKey, { titleKey: string }> = {
  playerCount: { titleKey: "ui.wizard.step1Title" },
  setting: { titleKey: "ui.wizard.step2Title" },
  characters: { titleKey: "ui.wizard.step3Title" },
  script: { titleKey: "ui.wizard.step4Title" },
};

const currentStep = ref<StepKey>("playerCount");
const playerCount = ref(2);
const selectedGenres = ref<Genre[]>([]);

const currentStepIndex = computed(() => stepKeys.indexOf(currentStep.value));
const isFirstStep = computed(() => currentStepIndex.value === 0);
const isLastStep = computed(
  () => currentStepIndex.value === stepKeys.length - 1,
);

const canGoNext = computed(() => {
  if (store.isLoading) return false;
  if (currentStep.value === "setting") return selectedGenres.value.length > 0;
  if (currentStep.value === "characters")
    return store.characters.length > 0 && !store.isLoading;
  return !isLastStep.value;
});

const nextButtonLabel = computed(() => {
  if (currentStep.value === "setting") return t("ui.wizard.generate");
  if (currentStep.value === "characters") return t("ui.wizard.generateScript");
  return t("ui.wizard.next");
});

function toggleGenre(genre: Genre, checked: boolean) {
  if (checked) {
    selectedGenres.value.push(genre);
  } else {
    const idx = selectedGenres.value.indexOf(genre);
    if (idx !== -1) selectedGenres.value.splice(idx, 1);
  }
}

function nextStepKey(): StepKey {
  return stepKeys[currentStepIndex.value + 1]!;
}

function prevStepKey(): StepKey {
  return stepKeys[currentStepIndex.value - 1]!;
}

async function goNext() {
  if (!canGoNext.value) return;

  if (currentStep.value === "setting") {
    currentStep.value = nextStepKey();
    await generateCharacters(playerCount.value, selectedGenres.value);
    return;
  }

  if (currentStep.value === "characters") {
    currentStep.value = nextStepKey();
    await generateScript(selectedGenres.value);
    return;
  }

  currentStep.value = nextStepKey();
}

function goBack() {
  if (!isFirstStep.value) {
    currentStep.value = prevStepKey();
  }
}

function isCompleted(key: StepKey) {
  return stepKeys.indexOf(key) < currentStepIndex.value;
}

function isActive(key: StepKey) {
  return key === currentStep.value;
}
</script>

<template>
  <div class="space-y-6">
    <!-- Step indicator -->
    <div class="space-y-4">
      <div class="flex items-center justify-center gap-2">
        <div
          v-for="key in stepKeys"
          :key="key"
          class="w-14 h-5"
          :class="{
            'bg-primary': isActive(key),
            'bg-neutral-500': isCompleted(key),
            'bg-neutral-800': !isActive(key) && !isCompleted(key),
          }"
        />
      </div>
      <p class="text-center text-primary text-xs tracking-widest uppercase">
        [ {{ t(steps[currentStep].titleKey).toUpperCase() }} ]
      </p>
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
      <!-- Player count (inline placeholder for PlayerCountInput) -->
      <div v-if="currentStep === 'playerCount'">
        <UFormField :label="t('ui.playerCount.label')">
          <UInputNumber v-model="playerCount" :min="1" :max="6" class="w-32" />
          <template #hint>
            {{ t("ui.playerCount.hint") }}
          </template>
        </UFormField>
      </div>

      <!-- Setting (inline placeholder for SettingForm) -->
      <div v-else-if="currentStep === 'setting'" class="space-y-4">
        <p class="text-sm font-medium">{{ t("ui.setting.label") }}</p>
        <div
          v-for="(genres, group) in GenreGroups"
          :key="group"
          class="space-y-2"
        >
          <p class="text-xs font-semibold uppercase text-neutral-500">
            {{ t(`ui.setting.groups.${group}`) }}
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

      <!-- Characters (placeholder for CharacterGrid) -->
      <div v-else-if="currentStep === 'characters'" class="space-y-4">
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

      <!-- GM Script (placeholder for GmScript) -->
      <div v-else-if="currentStep === 'script'" class="space-y-4">
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
        v-if="!isFirstStep"
        variant="outline"
        color="neutral"
        :disabled="store.isLoading"
        @click="goBack"
      >
        {{ t("ui.wizard.back") }}
      </UButton>
      <div v-else />

      <UButton
        v-if="!isLastStep"
        :disabled="!canGoNext"
        :loading="store.isLoading"
        @click="goNext"
      >
        {{ nextButtonLabel }}
      </UButton>
    </div>
  </div>
</template>
