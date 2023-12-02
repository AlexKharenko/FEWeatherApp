<template>
    <table class="weather-table">
        <thead class="table-head">
            <tr class="table-row">
                <th class="table-head-element head-city">
                    <SortButton
                        title="City"
                        is-alphabet
                        :sort-type="sortItems[0].sortType"
                        :is-toggled="sortItems[0].isToggled"
                        @click="onSortClick(0)"
                    />
                </th>
                <th class="table-head-element head-min-temp">
                    <SortButton
                        title="MinTemp"
                        :sort-type="sortItems[1].sortType"
                        :is-toggled="sortItems[1].isToggled"
                        @click="onSortClick(1)"
                    />
                </th>
                <th class="table-head-element head-max-temp">
                    <SortButton
                        title="MaxTemp"
                        :sort-type="sortItems[2].sortType"
                        :is-toggled="sortItems[2].isToggled"
                        @click="onSortClick(2)"
                    />
                </th>
                <th class="table-head-element"></th>
            </tr>
        </thead>
        <TransitionGroup name="body-transition" tag="tbody" class="table-body">
            <tr class="table-row" v-for="city in chosenCities" :key="city.id">
                <td class="table-body-element body-city">
                    <p class="city-name">
                        {{ city.cityName }},
                        <span class="country-short">{{ city.countryShort }}</span>
                    </p>
                </td>
                <td class="table-body-element body-min-temp">
                    {{ weatherData.get(city.id)?.daily.temperature_2m_min[0] }} &deg;
                </td>
                <td class="table-body-element body-max-temp">
                    {{ weatherData.get(city.id)?.daily.temperature_2m_max[0] }} &deg;
                </td>
                <td class="table-body-element remove-city">
                    <button type="button" @click="onRemoveClick(city.id)"><TrashIcon /></button>
                </td>
            </tr>
            <tr class="table-row" v-if="canAddCity">
                <td class="table-body-element add-city">
                    <CustomSelect :chosen-city-ids="chosenCityIds" @add-city="onAddCity" />
                </td>
            </tr>
        </TransitionGroup>
    </table>
</template>

<script setup lang="ts">
import type { City } from '@/types/city.type';
import type { WeatherResponse } from '@/types/weatherResponse.type';

import CustomSelect from '@/components/CustomSelect.vue';
import TrashIcon from './icons/TrashIcon.vue';

import { cities } from '@/data/cities';
import { computed } from 'vue';
import SortButton from '@/components/SortButton.vue';
import type { Sort } from '@/types/sort.type';

type Props = {
    chosenCityIds: number[];
    chosenCities: City[];
    weatherData: Map<number, WeatherResponse>;
    sortItems: Sort[];
};
type Emits = {
    (e: 'addCity', v: number): void;
    (e: 'removeCity', v: number): void;
    (e: 'sortCities', v: number): void;
};

const emit = defineEmits<Emits>();
const props = defineProps<Props>();

const canAddCity = computed(() => {
    return props.chosenCities.length !== cities.length;
});

const onAddCity = (id: number) => {
    emit('addCity', id);
};

const onRemoveClick = (id: number) => {
    emit('removeCity', id);
};

const onSortClick = (index: number) => {
    emit('sortCities', index);
};
</script>

<style lang="scss" scoped>
.weather-table {
    --grid-template-columns: minmax(160px, 1fr) repeat(2, minmax(120px, 150px)) 2.4rem;

    display: grid;
    grid-template-columns: var(--grid-template-columns);
    overflow-x: auto;
    overflow-y: hidden;
    position: relative;
    width: 100%;

    .table-body,
    .table-head {
        display: contents;
        .table-row {
            display: grid;
            grid-template-columns: var(--grid-template-columns);
            grid-column: 1 / span 4;

            &:nth-child(odd) {
                .table-body-element {
                    background-color: var(--color-background-cell-2);
                }
            }
            .table-head-element,
            .table-body-element {
                display: flex;
                justify-items: flex-start;
                background-color: var(--color-background-cell);
                padding: 0.3rem 0.5rem;
            }

            .table-body-element {
                &.add-city {
                    grid-column: 1 / span 4;
                }

                &.remove-city {
                    button {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: none;
                        color: inherit;
                        border: none;
                        height: 1.4rem;
                        aspect-ratio: 1 / 1;
                        cursor: pointer;
                        transition: filter 0.3s ease-in-out;

                        &:hover {
                            filter: invert(0.2);
                        }
                    }
                }
            }
        }
    }
}

.body-transition-move,
.body-transition-enter-active,
.body-transition-leave-active {
    transition: all 0.5s ease;
}

.body-transition-enter-from,
.body-transition-leave-to {
    opacity: 0;
    transform: translate(-30px 0);
}

.body-transition-leave-active {
    position: relative;
}
</style>
