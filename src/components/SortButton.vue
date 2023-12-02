<template>
    <button type="button" class="sort-button" :class="{ active: isToggled }">
        <p>{{ title }}</p>
        <div class="sort-block" :class="{ desc: sortType === 'desc' && !isAlphabet }">
            <SortAlphabetIcon class="alphabet" v-if="isAlphabet" />
            <SortIcon v-else />
        </div>
    </button>
</template>

<script setup lang="ts">
import SortIcon from './icons/SortIcon.vue';
import SortAlphabetIcon from './icons/SortAlphabetIcon.vue';
import type { SortType } from '@/types/sort.type';

type Props = {
    title: string;
    isAlphabet?: boolean;
    isToggled?: boolean;
    sortType: SortType;
};

defineProps<Props>();
</script>

<style lang="scss" scoped>
.sort-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font: inherit;
    color: inherit;
    background: none;
    border: none;
    cursor: pointer;
    transition: filter 0.3s ease-in-out;
    &:hover {
        filter: invert(0.2);
    }
    &.active {
        color: var(--color-active);
    }
    .sort-block {
        height: 100%;
        aspect-ratio: 1 / 1;
        svg {
            transition: transform 0.3s ease-in-out;
            height: inherit;
        }

        &.desc svg {
            transform: rotateX(180deg);
        }
    }
}
</style>
