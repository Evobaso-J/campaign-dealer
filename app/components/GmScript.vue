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

const TAB_ORDER = ["introduction", "targets", "rumors"] as const;

const activeTab = ref<string>("introduction");
const enabledTabs = ref(new Set<string>(["introduction"]));
const clickedTabs = ref(new Set<string>());

const tabItems = computed(() => [
  {
    label: t("ui.gmScript.introduction"),
    icon: "i-pixelarticons-anchor",
    slot: "introduction",
    value: "introduction",
  },
  {
    label: t("ui.gmScript.targets"),
    icon: "i-pixelarticons-target",
    slot: "targets",
    value: "targets",
    disabled: !enabledTabs.value.has("targets"),
  },
  {
    label: t("ui.gmScript.rumors"),
    icon: "i-pixelarticons-chat",
    slot: "rumors",
    value: "rumors",
    disabled: !enabledTabs.value.has("rumors"),
  },
]);

function goToNext() {
  const current = activeTab.value;
  const currentIdx = TAB_ORDER.indexOf(current as (typeof TAB_ORDER)[number]);
  const nextTab = TAB_ORDER[currentIdx + 1] as string | undefined;
  if (nextTab) {
    clickedTabs.value.add(current);
    enabledTabs.value.add(nextTab);
    activeTab.value = nextTab;
  }
}
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

    <!-- Tabbed script content -->
    <UTabs
      v-model="activeTab"
      :items="tabItems"
      variant="link"
      size="sm"
      class="flex-1 min-h-0 pixel-border pixel-shadow bg-primary"
      :ui="{
        root: 'flex flex-col min-h-0',
        content: 'flex-1 min-h-0',
      }"
    >
      <!-- Introduction tab -->
      <template #introduction>
        <div class="overflow-y-auto hide-scrollbar p-6 space-y-4 h-full">
          <p class="text-sm italic whitespace-pre-line leading-relaxed">
            {{ gmScript.introduction }}
          </p>

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

          <!-- Next button -->
          <div
            v-if="!clickedTabs.has('introduction')"
            class="pt-4 flex justify-end"
          >
            <button
              class="inline-flex items-center gap-1 text-xs uppercase font-bold cursor-pointer"
              @click="goToNext"
            >
              {{ t("ui.gmScript.next") }}
              <UIcon
                name="i-pixelarticons-chevron-right"
                class="size-4 animate-bounce-x"
              />
            </button>
          </div>
        </div>
      </template>

      <!-- Targets tab -->
      <template #targets>
        <div class="overflow-y-auto hide-scrollbar p-6 space-y-4 h-full">
          <div>
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

          <!-- Next button -->
          <div v-if="!clickedTabs.has('targets')" class="pt-4 flex justify-end">
            <button
              class="inline-flex items-center gap-1 text-xs uppercase font-bold cursor-pointer"
              @click="goToNext"
            >
              {{ t("ui.gmScript.next") }}
              <UIcon
                name="i-pixelarticons-chevron-right"
                class="size-4 animate-bounce-x"
              />
            </button>
          </div>
        </div>
      </template>

      <!-- Rumors tab -->
      <template #rumors>
        <div class="overflow-y-auto hide-scrollbar p-6 space-y-4 h-full">
          <div>
            <div v-for="(rumor, i) in gmScript.rumors" :key="i">
              <USeparator v-if="i > 0" />
              <p class="py-3 text-xs italic leading-relaxed">"{{ rumor }}"</p>
            </div>
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>
