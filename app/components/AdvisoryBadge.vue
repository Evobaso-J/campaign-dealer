<script setup lang="ts">
import type { ContentWarning } from "~~/shared/types/campaign";

const { t } = useI18n();

const props = defineProps<{
  warning: ContentWarning;
}>();

const iconMap: Record<ContentWarning, string> = {
  deathAndViolence: "i-streamline-pixel-hand-fiist",
  strongLanguage: "i-pixelarticons-alert",
  horror: "i-streamline-pixel-entertainment-events-hobbies-horror-ghost",
  substanceUse: "i-streamline-pixel-health-drug-medicine",
  mentalIllness: "i-streamline-pixel-health-brain-1",
};

const icon = computed(() => iconMap[props.warning]);
const label = computed(() => t(`ui.gmScript.contentWarning.${props.warning}`));
</script>

<template>
  <UTooltip
    :text="label"
    :delay-duration="0"
    :content="{
      align: 'start',
      side: 'top',
    }"
  >
    <UBadge class="p-1 text-primary-800" variant="outline">
      <UIcon :name="icon" class="size-5" />
    </UBadge>
  </UTooltip>
</template>
