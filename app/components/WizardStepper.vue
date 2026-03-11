<script setup lang="ts">
const { t } = useI18n();
const store = useCampaignStore();
const { generateCharacters, generateScript } = useCampaign();

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
  if (store.isLoading) return false;
  if (currentStep.value === "setting") return store.campaignSetting.length > 0;
  if (currentStep.value === "party") return store.selectedTemplates.length > 0;
  if (currentStep.value === "characters")
    return store.characters.length > 0 && !store.isLoading;
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

async function goNext() {
  if (!canGoNext.value) return;

  if (currentStep.value === "party" && !hasCharacters.value) {
    await generateCharacters(store.selectedTemplates, store.campaignSetting);
  }

  if (currentStep.value === "characters" && !hasScript.value) {
    await generateScript();
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
  <div class="space-y-6">
    <!-- Step indicator -->
    <div class="space-y-4">
      <div class="flex items-center justify-center gap-2">
        <button
          v-for="key in stepKeys"
          :key="key"
          class="w-14 h-5 pixel-border"
          :class="{
            'bg-primary': isActive(key),
            'bg-primary-600 cursor-pointer hover:bg-primary-500':
              !isActive(key) && isCompleted(key),
            'bg-neutral-800': !isActive(key) && !isCompleted(key),
          }"
          :aria-label="t(steps[key].titleKey)"
          :aria-current="isActive(key) ? 'step' : undefined"
          :disabled="!isCompleted(key) || isActive(key)"
          @click="currentStep = key"
        />
      </div>
      <h2 class="text-center">
        <span class="text-xs tracking-widest">
          {{ t(steps[currentStep].titleKey).toUpperCase() }}
        </span>
      </h2>
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
          v-if="store.generationStatus === 'generating-characters'"
          role="status"
          class="terminal-panel flex items-center gap-2 text-neutral-500"
        >
          <UIcon
            aria-hidden="true"
            name="i-lucide-loader-circle"
            class="animate-spin"
          />
          <span>{{ t("ui.status.generating") }}</span>
        </div>
        <div
          v-else-if="store.characters.length"
          class="terminal-panel text-center"
        >
          <span class="crt-badge mb-2">SYS_LOG</span>
          <p class="text-neutral-500 text-xs leading-relaxed mt-2">
            [CharacterGrid placeholder —
            {{ store.characters.length }} characters generated]
          </p>
        </div>
      </div>

      <!-- GM Script (placeholder for GmScript) -->
      <div v-else-if="currentStep === 'script'" class="space-y-4">
        <div
          v-if="store.generationStatus === 'generating-script'"
          role="status"
          class="terminal-panel flex items-center gap-2 text-neutral-500"
        >
          <UIcon
            aria-hidden="true"
            name="i-lucide-loader-circle"
            class="animate-spin"
          />
          <span>{{ t("ui.status.generating") }}</span>
        </div>
        <div v-else-if="store.gmScript" class="terminal-panel text-center">
          <span class="crt-badge mb-2">SYS_LOG</span>
          <p class="text-neutral-500 text-xs leading-relaxed mt-2">
            [GmScript placeholder — campaign script generated]
          </p>
        </div>
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
