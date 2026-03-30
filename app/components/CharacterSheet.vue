<script setup lang="ts">
import {
  archetypeInitials,
  type CharacterSheet,
  type CharacterSkill,
} from "~~/shared/types/character";

const { t } = useI18n();

type Props = {
  character: CharacterSheet;
  loading?: boolean;
};

const props = defineProps<Props>();

type Emits = {
  (e: "openPdf"): void;
};

const emit = defineEmits<Emits>();

const identity = computed(() => props.character.characterIdentity);

const selectedSkill = ref<CharacterSkill | null>(null);
const isSuitSkill = ref(false);
const isSkillModalOpen = computed({
  get: () => selectedSkill.value !== null,
  set: (v) => {
    if (!v) selectedSkill.value = null;
  },
});

function openSkill(skill: CharacterSkill, suit = false) {
  selectedSkill.value = skill;
  isSuitSkill.value = suit;
}
</script>

<template>
  <div
    role="article"
    :aria-label="`${identity.name}, ${t(`ui.selector.archetype.${character.archetype}`)} ${t(`ui.selector.suit.${character.suit}`)}`"
    class="pixel-border pixel-shadow bg-primary flex flex-col max-w-1/2"
  >
    <!-- Row 1: Name -->
    <div class="p-3 border-b-2 border-primary-800 flex items-baseline gap-2">
      <h4 class="text-xs uppercase leading-tight font-bold truncate">
        {{ identity.name }}
      </h4>
      <span
        v-if="identity.pronouns"
        class="text-[0.5rem] opacity-70 font-bold uppercase italic shrink-0"
      >
        ({{ identity.pronouns }})
      </span>
    </div>

    <!-- Row 2: Avatar + Concept/Items -->
    <div class="p-3 flex gap-3 max-h-32">
      <!-- Left column: card avatar -->
      <div
        class="aspect-square pixel-border-thick bg-primary-400 relative overflow-hidden shrink-0"
      >
        <div
          aria-hidden="true"
          class="absolute top-1 left-1.5 flex flex-col items-center leading-none z-10 aspect-square"
        >
          <span class="text-sm font-bold">
            {{ archetypeInitials[character.archetype] }}
          </span>
          <UIcon :name="suitIcons[character.suit]!" class="text-base" />
        </div>
        <NuxtImg
          :src="`/cards/${character.archetype}_${character.suit}.svg`"
          :alt="`${t(`ui.selector.archetype.${character.archetype}`)}-${t(`ui.selector.suit.${character.suit}`)}`"
          class="absolute top-0 left-0 w-full object-contain"
        />
      </div>

      <!-- Right column: concept + items -->
      <div
        class="mask-[linear-gradient(to_bottom,black_calc(100%-1.5rem),transparent)] w-2/3 min-h-0"
      >
        <div
          class="h-full flex flex-col gap-3 pb-6 overflow-y-scroll hide-scrollbar"
        >
          <p
            v-if="identity.concept"
            class="text-[0.625rem] italic leading-snug opacity-80"
          >
            {{ identity.concept }}
          </p>

          <hr
            v-if="identity.concept && (identity.weapon || identity.instrument)"
            class="border-primary-800"
          />

          <div
            v-if="identity.weapon || identity.instrument"
            class="flex flex-col gap-1.5 text-[0.625rem]"
          >
            <div
              v-if="identity.weapon"
              class="flex items-center justify-between gap-2"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-pixelarticons-sword" class="size-3 shrink-0" />
                <span class="font-bold">{{ identity.weapon.name }}</span>
              </div>
              <span
                v-if="identity.weapon.concealed"
                class="text-[0.5rem] shrink-0"
              >
                [{{ t("ui.character.concealed") }}]
              </span>
            </div>
            <div
              v-if="identity.instrument"
              class="flex items-center justify-between gap-2"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-pixelarticons-briefcase"
                  class="size-3 shrink-0"
                />
                <span class="font-bold">{{ identity.instrument.name }}</span>
              </div>
              <span
                v-if="identity.instrument.concealed"
                class="text-[0.5rem] shrink-0"
              >
                [{{ t("ui.character.concealed") }}]
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 3: Skill names + actions -->
    <div
      class="p-3 border-t-2 border-primary-800 flex flex-col sm:flex-row sm:items-center gap-2"
    >
      <div class="flex flex-wrap gap-1.5 flex-1">
        <UButton
          variant="outline"
          size="xs"
          trailing-icon="i-pixelarticons-info-box"
          :label="t(character.suitSkill.name).toUpperCase()"
          :ui="{
            label: 'text-[0.5rem] truncate',
            trailingIcon: 'text-primary-800',
          }"
          @click="openSkill(character.suitSkill, true)"
        />
        <UButton
          v-for="(skill, idx) in character.archetypeSkills"
          :key="idx"
          variant="outline"
          size="xs"
          trailing-icon="i-pixelarticons-info-box"
          :label="t(skill.name).toUpperCase()"
          :ui="{
            label: 'text-[0.5rem] truncate',
            trailingIcon: 'text-primary-800',
          }"
          @click="openSkill(skill)"
        />
      </div>
      <div class="flex gap-1 shrink-0">
        <UButton
          icon="i-pixelarticons-file-text"
          size="xs"
          variant="outline"
          :aria-label="t('ui.pdf.open')"
          @click="emit('openPdf')"
        />
      </div>
    </div>
  </div>

  <UModal
    v-model:open="isSkillModalOpen"
    :ui="{
      content: 'rounded-none border-8 border-primary-800 bg-primary ring-0',
      overlay: 'bg-primary-900/50',
    }"
  >
    <template #content>
      <div v-if="selectedSkill" class="flex flex-col gap-4 p-4">
        <div class="flex items-start justify-between">
          <div class="space-y-1">
            <p
              class="text-lg uppercase tracking-widest text-primary-800 inline-flex items-center gap-2"
            >
              <UIcon
                v-if="isSuitSkill"
                :name="suitIcons[character.suit]"
                class="size-5"
              />
              {{ t(selectedSkill.name) }}
            </p>
            <p
              v-if="selectedSkill.uses"
              class="text-xs uppercase tracking-widest text-primary-800/70"
            >
              [{{ selectedSkill.uses.usesLeft }}/{{
                selectedSkill.uses.maxUses
              }}]
            </p>
          </div>

          <UButton
            icon="i-pixelarticons-close"
            size="xl"
            :ui="{
              base: 'p-0',
              leadingIcon: 'text-primary-800',
            }"
            variant="ghost"
            @click="isSkillModalOpen = false"
          />
        </div>

        <p class="text-xs leading-relaxed text-primary-800">
          {{ t(selectedSkill.description) }}
        </p>
      </div>
    </template>
  </UModal>
</template>
