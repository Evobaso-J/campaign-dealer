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
  <div class="flex flex-col gap-4 min-h-0">
    <!-- Title + Content Warnings -->
    <div class="flex items-center gap-3">
      <h2 class="text-lg uppercase font-bold truncate">
        {{ gmScript.name }}
      </h2>
      <div
        v-if="gmScript.contentWarnings?.length"
        class="flex flex-wrap gap-1 shrink-0"
      >
        <AdvisoryBadge
          v-for="warning in gmScript.contentWarnings"
          :key="warning"
          :warning="warning"
        />
      </div>
    </div>

    <!-- Scrollable script container -->
    <div
      class="pixel-border pixel-shadow bg-primary flex-1 min-h-0 overflow-y-scroll hide-scrollbar p-6 space-y-4"
    >
      <!-- Introduction -->
      <div>
        <div class="flex items-center gap-2 pb-3 border-b-2 border-primary-800">
          <UIcon name="i-pixelarticons-anchor" class="shrink-0" />
          <span class="text-xs uppercase font-bold">{{
            t("ui.gmScript.introduction")
          }}</span>
        </div>
        <p class="pt-3 text-sm italic whitespace-pre-line leading-relaxed">
          {{ gmScript.introduction }}
        </p>
      </div>

      <!-- Weapons & Instruments -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div
            class="flex items-center gap-2 pb-3 border-b-2 border-primary-800"
          >
            <UIcon name="i-pixelarticons-sword" class="shrink-0" />
            <span class="text-xs uppercase font-bold">{{
              t("ui.gmScript.weapons")
            }}</span>
          </div>
          <p class="pt-3 text-xs italic leading-relaxed">
            {{ gmScript.weapons.join(", ") }}
          </p>
        </div>
        <div>
          <div
            class="flex items-center gap-2 pb-3 border-b-2 border-primary-800"
          >
            <UIcon name="i-pixelarticons-briefcase" class="shrink-0" />
            <span class="text-xs uppercase font-bold">{{
              t("ui.gmScript.instruments")
            }}</span>
          </div>
          <p class="pt-3 text-xs italic leading-relaxed">
            {{ gmScript.instruments.join(", ") }}
          </p>
        </div>
      </div>

      <!-- Targets -->
      <div>
        <div class="flex items-center gap-2 pb-3 border-b-2 border-primary-800">
          <UIcon name="i-pixelarticons-target" class="shrink-0" />
          <span class="text-xs uppercase font-bold">{{
            t("ui.gmScript.targets")
          }}</span>
        </div>
        <div v-for="(arch, idx) in targetArchetypes" :key="arch">
          <USeparator v-if="idx > 0" />
          <div class="py-3 space-y-2">
            <div class="flex items-center gap-2">
              <UBadge
                color="neutral"
                variant="outline"
                class="capitalize shrink-0"
              >
                {{ t(`ui.selector.archetype.${arch}`) }}
              </UBadge>
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
          </div>
        </div>
      </div>

      <!-- Rumors -->
      <div>
        <div class="flex items-center gap-2 pb-3 border-b-2 border-primary-800">
          <UIcon name="i-pixelarticons-chat" class="shrink-0" />
          <span class="text-xs uppercase font-bold">{{
            t("ui.gmScript.rumors")
          }}</span>
          <UBadge color="neutral" variant="subtle" size="sm" class="ml-auto">
            {{ gmScript.rumors.length }}
          </UBadge>
        </div>
        <div v-for="(rumor, i) in gmScript.rumors" :key="i">
          <USeparator v-if="i > 0" />
          <p class="py-3 text-xs italic leading-relaxed">"{{ rumor }}"</p>
        </div>
      </div>
    </div>
  </div>
</template>
