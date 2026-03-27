<script setup lang="ts">
import {
  archetypeInitials,
  type CharacterSheet,
} from "~~/shared/types/character";

const { t } = useI18n();

const props = defineProps<{
  character: CharacterSheet;
  loading?: boolean;
}>();

defineEmits<{
  reroll: [];
  openPdf: [];
}>();

const identity = computed(() => props.character.characterIdentity);
</script>

<template>
  <div
    role="article"
    :aria-label="`${identity.name}, ${t(`ui.selector.archetype.${character.archetype}`)} ${t(`ui.selector.suit.${character.suit}`)}`"
    class="pixel-border pixel-shadow bg-primary flex flex-col"
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
    <div class="p-3 grid grid-cols-[1fr_2fr] gap-3">
      <!-- Left column: card avatar -->
      <div
        class="aspect-square pixel-border-thick bg-primary-400 relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          class="absolute top-1 left-1.5 flex flex-col items-center leading-none z-10"
        >
          <span class="text-sm font-bold">
            {{ archetypeInitials[character.archetype] }}
          </span>
          <UIcon :name="suitIcons[character.suit]!" class="text-base" />
        </div>
        <NuxtImg
          :src="`/cards/${character.archetype}_${character.suit}.svg`"
          :alt="`${t(`ui.selector.archetype.${character.archetype}`)}-${t(`ui.selector.suit.${character.suit}`)}`"
          class="absolute top-0 left-0 w-full object-cover object-top p-1"
        />
      </div>

      <!-- Right column: concept + items -->
      <div
        class="relative min-w-0 mask-[linear-gradient(to_bottom,black_calc(100%-1.5rem),transparent)]"
      >
        <div class="absolute inset-0 flex flex-col gap-3 pb-6 overflow-y-auto">
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
        <span class="crt-badge text-[0.5rem] inline-flex items-center gap-1">
          <UIcon :name="suitIcons[character.suit]" class="size-2.5" />
          {{ t(character.suitSkill.name).toUpperCase() }}
        </span>
        <span
          v-for="(skill, idx) in character.archetypeSkills"
          :key="idx"
          class="crt-badge text-[0.5rem]"
        >
          {{ t(skill.name).toUpperCase() }}
        </span>
      </div>
      <div class="flex gap-1 shrink-0">
        <UButton
          icon="i-pixelarticons-file-text"
          size="xs"
          variant="outline"
          :aria-label="t('ui.pdf.open')"
          @click="$emit('openPdf')"
        />
        <UButton
          icon="i-pixelarticons-reload"
          size="xs"
          variant="outline"
          :loading="loading"
          :aria-label="t('ui.wizard.reroll')"
          @click="$emit('reroll')"
        />
      </div>
    </div>
  </div>
</template>
