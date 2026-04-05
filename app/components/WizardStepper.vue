<script setup lang="ts">
import { useCharacterPdf } from "~/composables/useCharacterPdf";

const { t } = useI18n();
const store = useCampaignStore();
const { generateCharacters, generateScript } = useCampaign();
const { openPdf } = useCharacterPdf();

const stepKeys = ["setting", "party", "characters", "script"] as const;
type StepKey = (typeof stepKeys)[number];

const steps: Record<StepKey, { titleKey: string }> = {
  setting: { titleKey: "ui.wizard.step1Title" },
  party: { titleKey: "ui.wizard.step2Title" },
  characters: { titleKey: "ui.wizard.step3Title" },
  script: { titleKey: "ui.wizard.step4Title" },
};

const currentStep = ref<StepKey>("setting");

const currentStepIndex = computed(() => stepKeys.indexOf(currentStep.value));
const isFirstStep = computed(() => currentStepIndex.value === 0);
const isLastStep = computed(
  () => currentStepIndex.value === stepKeys.length - 1,
);

const canGoNext = computed(() => {
  if (currentStep.value === "setting") return store.campaignSetting.length > 0;
  if (currentStep.value === "party") return store.selectedTemplates.length > 0;
  return !isLastStep.value;
});

const hasCharacters = computed(() => store.characters.length > 0);
const hasScript = computed(() => store.gmScript !== undefined);

const nextButtonLabel = computed(() => {
  if (currentStep.value === "party" && !hasCharacters.value)
    return t("ui.wizard.generate");
  if (currentStep.value === "characters" && !hasScript.value)
    return t("ui.wizard.generateScript");
  return t("ui.wizard.next");
});

function nextStepKey(): StepKey {
  return stepKeys[currentStepIndex.value + 1]!;
}

function prevStepKey(): StepKey {
  return stepKeys[currentStepIndex.value - 1]!;
}

function goNext() {
  if (!canGoNext.value) return;

  if (currentStep.value === "party" && !hasCharacters.value) {
    generateCharacters(store.selectedTemplates, store.campaignSetting);
  }

  if (currentStep.value === "characters" && !hasScript.value) {
    generateScript();
  }

  currentStep.value = nextStepKey();
}

function goBack() {
  if (!isFirstStep.value) {
    currentStep.value = prevStepKey();
  }
}

function isCompleted(key: StepKey) {
  if (key === "party") return store.selectedTemplates.length > 0;
  if (key === "setting") return store.campaignSetting.length > 0;
  if (key === "characters") return hasCharacters.value;
  if (key === "script") return hasScript.value;
  return stepKeys.indexOf(key) < currentStepIndex.value;
}

function isActive(key: StepKey) {
  return key === currentStep.value;
}
</script>

<template>
  <div class="flex flex-col gap-6 flex-1 min-h-0">
    <!-- Step indicator -->
    <div class="space-y-4">
      <div class="flex items-center justify-center gap-2">
        <button
          v-for="key in stepKeys"
          :key="key"
          class="w-14 h-5 pixel-border"
          :class="{
            'bg-primary': isActive(key),
            'bg-primary-600 cursor-pointer hover:bg-primary':
              !isActive(key) && isCompleted(key),
            'bg-neutral-800': !isActive(key) && !isCompleted(key),
          }"
          :aria-label="t(steps[key].titleKey)"
          :aria-current="isActive(key) ? 'step' : undefined"
          :disabled="!isCompleted(key) || isActive(key)"
          @click="currentStep = key"
        />
      </div>
      <h2 v-if="currentStep !== 'script'" class="text-center">
        <span class="text-xs tracking-widest">
          {{ t(steps[currentStep].titleKey).toUpperCase() }}
        </span>
      </h2>
    </div>

    <!-- Error alert -->
    <UAlert
      v-if="store.errorMessage"
      color="error"
      icon="i-pixelarticons-close-box"
      :title="t('ui.status.error')"
      :description="store.errorMessage"
    />

    <!-- Step content -->
    <div class="flex-1 min-h-0 flex flex-col">
      <!-- Setting -->
      <div v-if="currentStep === 'setting'">
        <SettingForm v-model="store.campaignSetting" />
      </div>

      <!-- Character selector -->
      <div v-else-if="currentStep === 'party'">
        <CharacterSelector v-model="store.selectedTemplates" />
      </div>

      <!-- Characters (placeholder for CharacterGrid) -->
      <div v-else-if="currentStep === 'characters'" class="space-y-4">
        <div
          v-if="store.characters.length"
          class="flex flex-wrap justify-center gap-6"
        >
          <CharacterSheet
            v-for="(char, idx) in store.characters"
            :key="idx"
            :character="char"
            @open-pdf="openPdf(char)"
          />
        </div>
      </div>

      <!-- GM Script -->
      <ScriptStep
        v-else-if="currentStep === 'script'"
        class="flex flex-col flex-1 min-h-0"
      />
    </div>

    <!-- Navigation buttons -->
    <div class="flex items-center justify-between shrink-0">
      <UButton
        v-if="!isFirstStep"
        variant="outline"
        color="neutral"
        @click="goBack"
      >
        {{ t("ui.wizard.back") }}
      </UButton>
      <div v-else />

      <UButton v-if="!isLastStep" :disabled="!canGoNext" @click="goNext">
        {{ nextButtonLabel }}
      </UButton>
    </div>
  </div>
</template>
