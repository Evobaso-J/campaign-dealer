<script setup lang="ts">
import type { TargetArchetype } from "~~/shared/types/campaign";

const { t } = useI18n();
const store = useCampaignStore();

const gmScript = computed(() => store.gmScript!);
const targetArchetypes = [
  "king",
  "queen",
  "jack",
] as const satisfies readonly TargetArchetype[];
</script>

<template>
  <div class="space-y-4">
    <!-- Content Warnings -->
    <div
      v-if="gmScript.contentWarnings?.length"
      class="pixel-border pixel-shadow bg-primary flex flex-col"
    >
      <div class="p-3 border-b-2 border-primary-800 flex items-center gap-2">
        <UIcon name="i-pixelarticons-warning-box" class="shrink-0" />
        <span class="text-xs uppercase font-bold">{{
          t("ui.gmScript.contentWarnings")
        }}</span>
      </div>
      <div class="p-3 flex flex-wrap gap-2">
        <span
          v-for="warning in gmScript.contentWarnings"
          :key="warning"
          class="crt-badge"
        >
          {{ t(`ui.gmScript.contentWarning.${warning}`) }}
        </span>
      </div>
    </div>

    <!-- Introduction -->
    <div class="pixel-border pixel-shadow bg-primary flex flex-col">
      <div class="p-3 border-b-2 border-primary-800 flex items-center gap-2">
        <UIcon name="i-pixelarticons-anchor" class="shrink-0" />
        <span class="text-xs uppercase font-bold">{{
          t("ui.gmScript.introduction")
        }}</span>
      </div>
      <div class="p-3">
        <p class="text-sm italic whitespace-pre-line leading-relaxed">
          {{ gmScript.introduction }}
        </p>
      </div>
    </div>

    <!-- Weapons & Instruments -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="pixel-border pixel-shadow bg-primary flex flex-col">
        <div class="p-3 border-b-2 border-primary-800 flex items-center gap-2">
          <UIcon name="i-pixelarticons-sword" class="shrink-0" />
          <span class="text-xs uppercase font-bold">{{
            t("ui.gmScript.weapons")
          }}</span>
        </div>
        <div class="p-3">
          <p class="text-xs italic leading-relaxed">
            {{ gmScript.weapons.join(", ") }}
          </p>
        </div>
      </div>
      <div class="pixel-border pixel-shadow bg-primary flex flex-col">
        <div class="p-3 border-b-2 border-primary-800 flex items-center gap-2">
          <UIcon name="i-pixelarticons-briefcase" class="shrink-0" />
          <span class="text-xs uppercase font-bold">{{
            t("ui.gmScript.instruments")
          }}</span>
        </div>
        <div class="p-3">
          <p class="text-xs italic leading-relaxed">
            {{ gmScript.instruments.join(", ") }}
          </p>
        </div>
      </div>
    </div>

    <!-- Targets -->
    <div class="pixel-border pixel-shadow bg-primary flex flex-col">
      <div class="p-3 border-b-2 border-primary-800 flex items-center gap-2">
        <UIcon name="i-pixelarticons-target" class="shrink-0" />
        <span class="text-xs uppercase font-bold">{{
          t("ui.gmScript.targets")
        }}</span>
      </div>
      <div>
        <div
          v-for="(arch, idx) in targetArchetypes"
          :key="arch"
          class="p-3 space-y-2"
          :class="{ 'border-t-2 border-primary-800': idx > 0 }"
        >
          <div class="flex items-center gap-2">
            <span class="crt-badge capitalize">{{
              t(`ui.selector.archetype.${arch}`)
            }}</span>
            <span class="font-bold text-sm">{{
              gmScript.targets[arch].name
            }}</span>
          </div>
          <p class="text-xs leading-relaxed whitespace-pre-line">
            {{ gmScript.targets[arch].description }}
          </p>
          <div class="pl-3 border-l-2 border-primary-800 space-y-2">
            <div>
              <p class="text-xs uppercase font-bold text-primary-600">
                {{ t("ui.gmScript.locations") }}
              </p>
              <p class="text-xs leading-relaxed">
                {{ gmScript.targets[arch].locations }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase font-bold text-primary-600">
                {{ t("ui.gmScript.defenses") }}
              </p>
              <p class="text-xs leading-relaxed">
                {{ gmScript.targets[arch].defenses }}
              </p>
            </div>
          </div>
          <div
            v-if="gmScript.targets[arch].fate"
            class="flex items-center gap-1"
          >
            <span class="text-xs uppercase font-bold text-primary-600"
              >{{ t("ui.gmScript.fate") }}:</span
            >
            <span class="crt-badge">{{
              t(`ui.gmScript.targetFate.${gmScript.targets[arch].fate}`)
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Rumors -->
    <div class="pixel-border pixel-shadow bg-primary flex flex-col">
      <div class="p-3 border-b-2 border-primary-800 flex items-center gap-2">
        <UIcon name="i-pixelarticons-chat" class="shrink-0" />
        <span class="text-xs uppercase font-bold">{{
          t("ui.gmScript.rumors")
        }}</span>
        <span class="crt-badge ml-auto">{{ gmScript.rumors.length }}</span>
      </div>
      <div>
        <p
          v-for="(rumor, i) in gmScript.rumors"
          :key="i"
          class="p-3 text-xs italic leading-relaxed"
          :class="{ 'border-t-2 border-primary-800': i > 0 }"
        >
          "{{ rumor }}"
        </p>
      </div>
    </div>
  </div>
</template>
