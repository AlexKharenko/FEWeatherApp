<template>
    <select class="custom-select" name="city" v-model="selected" @change="onSelect">
        <option :value="-1" v-if="citiesToChoose.length > 0" disabled>
            &plus; Select city to add
        </option>
        <option v-for="city in citiesToChoose" :key="city.id" :value="city.id">
            <p class="city">
                {{ city.cityName }} &#40;<span class="country-short"
                    >{{ city.countryShort }}&#41;</span
                >
            </p>
        </option>
        <option v-if="citiesToChoose.length === 0" disabled>No cities to choose</option>
    </select>
</template>

<script setup lang="ts">
import { cities } from '@/data/cities';
import { computed, ref } from 'vue';

type Props = {
    chosenCityIds: number[];
};

type Emits = {
    (e: 'addCity', v: number): void;
};

const selected = ref(-1);

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const citiesToChoose = computed(() => {
    return cities.filter((item) => !props.chosenCityIds.includes(item.id));
});

const onSelect = () => {
    emit('addCity', selected.value);
    selected.value = -1;
};
</script>

<style lang="scss" scoped>
.custom-select {
    background-color: inherit;
    border: none;
    color: inherit;
    display: flex;
    flex: 1;
    font-size: 1em;
}
</style>
