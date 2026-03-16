<script setup lang="ts">
import type { CharacterSheet, CharacterSkill } from "~~/shared/types/character";

const { t } = useI18n();

const props = defineProps<{
  character: CharacterSheet;
  loading?: boolean;
}>();

defineEmits<{
  reroll: [];
  download: [];
}>();

const identity = computed(() => props.character.characterIdentity);

function usesDisplay(skill: CharacterSkill) {
  if (!skill.uses) return null;
  return {
    filled: skill.uses.usesLeft,
    empty: skill.uses.maxUses - skill.uses.usesLeft,
    total: skill.uses.maxUses,
    left: skill.uses.usesLeft,
  };
}
</script>

<template>
  <div
    role="article"
    :aria-label="`${identity.name}, ${t(`ui.selector.archetype.${character.archetype}`)} ${t(`ui.selector.suit.${character.suit}`)}`"
    class="pixel-border pixel-shadow bg-primary flex flex-col"
  >
    <!-- Header -->
    <div class="p-3 border-b-2 border-primary-800 flex flex-col gap-1.5">
      <div class="flex justify-between items-start gap-2">
        <div class="min-w-0">
          <h4 class="text-xs uppercase leading-tight font-bold truncate">
            {{ identity.name }}
          </h4>
          <span
            v-if="identity.pronouns"
            class="text-[0.5rem] opacity-70 font-bold uppercase italic"
          >
            ({{ identity.pronouns }})
          </span>
        </div>
        <div class="flex gap-1">
          <UButton
            icon="i-lucide-download"
            size="xs"
            variant="outline"
            :aria-label="t('ui.pdf.download')"
            @click="$emit('download')"
          />
          <UButton
            icon="i-lucide-refresh-cw"
            size="xs"
            variant="outline"
            :loading="loading"
            :aria-label="t('ui.wizard.reroll')"
            @click="$emit('reroll')"
          />
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <span class="crt-badge">
          {{ t(`ui.selector.archetype.${character.archetype}`).toUpperCase() }}
        </span>
        <span class="crt-badge inline-flex items-center gap-1">
          <UIcon :name="suitIcons[character.suit]" class="size-3" />
          {{ t(`ui.selector.suit.${character.suit}`).toUpperCase() }}
        </span>
      </div>
    </div>

    <!-- Body — horizontal 2-column layout -->
    <div class="p-3 flex flex-col sm:flex-row gap-3">
      <!-- Left column: concept + items -->
      <div
        class="flex flex-col gap-3 sm:w-2/5 sm:border-r sm:border-primary-800/30 sm:pr-3"
      >
        <p
          v-if="identity.concept"
          class="text-[0.625rem] italic leading-snug opacity-80"
        >
          {{ identity.concept }}
        </p>

        <div
          v-if="identity.weapon || identity.instrument"
          class="flex flex-col gap-1.5 text-[0.625rem]"
        >
          <div v-if="identity.weapon" class="flex items-center gap-2">
            <UIcon name="i-lucide-sword" class="size-3 shrink-0" />
            <span class="font-bold">{{ identity.weapon.name }}</span>
            <span
              v-if="identity.weapon.concealed"
              class="crt-badge text-[0.5rem]"
            >
              {{ t("ui.character.concealed") }}
            </span>
          </div>
          <div v-if="identity.instrument" class="flex items-center gap-2">
            <UIcon name="i-lucide-music" class="size-3 shrink-0" />
            <span class="font-bold">{{ identity.instrument.name }}</span>
            <span
              v-if="identity.instrument.concealed"
              class="crt-badge text-[0.5rem]"
            >
              {{ t("ui.character.concealed") }}
            </span>
          </div>
        </div>
      </div>

      <!-- Mobile separator -->
      <div class="h-px dither-sm sm:hidden" />

      <!-- Right column: skills -->
      <div class="flex flex-col gap-3 sm:w-3/5">
        <!-- Suit Skill -->
        <div class="space-y-1">
          <span class="crt-badge text-[0.5rem]">
            {{ t("ui.character.suitSkill").toUpperCase() }}
          </span>
          <p class="text-[0.625rem] leading-snug">
            <span class="font-bold uppercase block text-[0.6rem] mb-0.5">
              {{ t(character.suitSkill.name) }}
            </span>
            {{ t(character.suitSkill.description) }}
          </p>
        </div>

        <div class="h-px dither-sm" />

        <!-- Archetype Skills -->
        <div class="space-y-2">
          <span class="crt-badge text-[0.5rem]">
            {{ t("ui.character.archetypeSkills").toUpperCase() }}
          </span>
          <ul class="space-y-2 text-[0.625rem]">
            <li
              v-for="(skill, idx) in character.archetypeSkills"
              :key="idx"
              class="flex flex-col"
            >
              <p class="leading-snug">
                <span class="font-bold uppercase block text-[0.6rem] mb-0.5">
                  {{ t(skill.name) }}
                </span>
                {{ t(skill.description) }}
              </p>
              <div
                v-if="usesDisplay(skill)"
                class="flex items-center gap-1 mt-1"
                :aria-label="`${usesDisplay(skill)!.left} of ${usesDisplay(skill)!.total} uses remaining`"
              >
                <span
                  v-for="n in usesDisplay(skill)!.total"
                  :key="n"
                  class="inline-block size-2.5 pixel-border"
                  :class="
                    n <= usesDisplay(skill)!.filled
                      ? 'bg-primary-400'
                      : 'bg-transparent'
                  "
                />
                <span class="text-[0.5rem] opacity-50 ml-1">
                  {{ usesDisplay(skill)!.left }}/{{ usesDisplay(skill)!.total }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
