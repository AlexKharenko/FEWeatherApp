<template>
    <div class="date-picker-conhainer">
        <label for="date-picker">Click on date to choose day of forcast:</label>
        <VueDatePicker
            id="date-picker"
            v-model="forecastDate"
            :clearable="false"
            :min-date="ApiDateLimitPast"
            :max-date="ApiDateLimitFuture"
            :enable-time-picker="false"
        />
    </div>
    <WeatherTable
        :chosen-cities="chosenCities"
        :chosen-city-ids="chosenCityIds"
        :weather-data="weatherData"
        :sort-items="sortItems"
        @add-city="onAddCity"
        @remove-city="onRemoveCity"
        @sort-cities="onSortCities"
    />
</template>

<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

import WeatherTable from '@/components/WeatherTable.vue';
import { useLocalStorage } from '@/composables/useLocalStorage';

import { ref, onMounted, computed, watch, reactive } from 'vue';

import type { WeatherResponse } from '@/types/weatherResponse.type';
import { cities } from '@/data/cities';
import type { City } from './types/city.type';
import type { Sort, SortType } from './types/sort.type';

const chosenCityIds = useLocalStorage<number[]>('cityIds', []);
const chosenCities = computed<City[]>(() => {
    return (chosenCityIds.value || [])
        .map((id) => cities.find((city) => city.id === id))
        .filter((city): city is City => city !== undefined);
});
const weatherData = ref<Map<number, WeatherResponse>>(new Map());

const forecastDate = ref(new Date());
const currentDate = new Date();
const ApiDateLimitPast = new Date(currentDate);
ApiDateLimitPast.setMonth(currentDate.getMonth() - 3); //Limit on 3 month by api
const ApiDateLimitFuture = new Date(currentDate);
ApiDateLimitFuture.setDate(currentDate.getDate() + 15); // Limit on 16 days by api

const sortItems = reactive<Sort[]>([
    { column: 'city', isToggled: false, sortType: 'desc' },
    { column: 'minTemp', isToggled: false, sortType: 'desc' },
    { column: 'maxTemp', isToggled: false, sortType: 'desc' }
]);

const makeUrl = (city: City): URL => {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.append('longitude', city.longitude.toString());
    url.searchParams.append('latitude', city.latitude.toString());
    url.searchParams.append('daily', 'temperature_2m_max,temperature_2m_min');
    url.searchParams.append('start_date', forecastDate.value.toISOString().split('T')[0]);
    url.searchParams.append('end_date', forecastDate.value.toISOString().split('T')[0]);
    return url;
};

const getWeatherInfo = async (city: City): Promise<WeatherResponse> => {
    const url = makeUrl(city);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch weather data. Status: ${response.status}`);
    }
    const data: WeatherResponse = await response.json();
    return data;
};

const onAddCity = async (id: number): Promise<void> => {
    const city = cities.find((item) => item.id === id);
    if (!city) return;
    try {
        offIsToggledInSortItems();
        const data = await getWeatherInfo(city);
        weatherData.value.set(id, data);
        addCity(id);
    } catch (err) {
        alert(err);
    }
};

const addCity = (id: number): void => {
    chosenCityIds.value.push(id);
};

const onRemoveCity = async (id: number): Promise<void> => {
    const city = chosenCities.value.find((item) => item.id === id);
    if (!city) return;
    const confirmedToRemoveCity = confirm(
        `Do you want to remove ${city.cityName}, (${city.countryShort}) from the list?`
    );
    if (!confirmedToRemoveCity) return;
    removeCity(id);
    weatherData.value.delete(id);
};

const removeCity = (id: number): void => {
    chosenCityIds.value = chosenCityIds.value.filter((item) => item !== id);
};

const sortByCityName = (sortType: SortType) => {
    const sorted = [...chosenCities.value];
    sorted.sort((a, b) => {
        const nameA = a.cityName.toUpperCase();
        const nameB = b.cityName.toUpperCase();

        if (sortType === 'asc') {
            return nameA.localeCompare(nameB);
        } else {
            return nameB.localeCompare(nameA);
        }
    });

    chosenCityIds.value = sorted.map((item) => item.id);
};

const sortByTemp = (key: 'minTemp' | 'maxTemp', sortType: SortType) => {
    const sorted = [...chosenCityIds.value].sort((a, b) => {
        const cityAWeather = weatherData.value.get(a);
        const cityBWeather = weatherData.value.get(b);

        if (cityAWeather && cityBWeather) {
            const tempA =
                key === 'maxTemp'
                    ? Math.max(...cityAWeather.daily.temperature_2m_max)
                    : Math.min(...cityAWeather.daily.temperature_2m_min);
            const tempB =
                key === 'maxTemp'
                    ? Math.max(...cityBWeather.daily.temperature_2m_max)
                    : Math.min(...cityBWeather.daily.temperature_2m_min);

            return sortType === 'asc' ? tempA - tempB : tempB - tempA;
        }
        return 0;
    });

    chosenCityIds.value = sorted;
};

const offIsToggledInSortItems = () => {
    sortItems.forEach((item) => (item.isToggled = false));
};

const onSortCities = (index: number) => {
    if (!sortItems[index].isToggled) {
        offIsToggledInSortItems();
        sortItems[index].isToggled = true;
    } else {
        sortItems[index].sortType = sortItems[index].sortType === 'desc' ? 'asc' : 'desc';
    }
    switch (sortItems[index].column) {
        case 'city':
            sortByCityName(sortItems[index].sortType);
            break;
        case 'minTemp':
            sortByTemp('minTemp', sortItems[index].sortType);
            break;
        case 'maxTemp':
            sortByTemp('maxTemp', sortItems[index].sortType);
            break;
    }
};

const getWeatherForAllCities = async () => {
    try {
        const requests = chosenCities.value.map((item) => getWeatherInfo(item));
        const data = await Promise.all(requests);
        data.forEach((item, index) => weatherData.value.set(chosenCities.value[index].id, item));
    } catch (err) {
        alert(err);
    }
};

watch(forecastDate, () => {
    offIsToggledInSortItems();
    getWeatherForAllCities();
});

onMounted(async () => {
    await getWeatherForAllCities();
});
</script>

<style lang="scss">
.dp__main {
    .dp__input_wrap {
        .dp__input {
            width: 100%;
            font: inherit;
            font-size: 3rem;
            border: none;
            background-color: transparent;
            color: inherit;
            padding: 0 0 1rem 0;

            & + div .dp__input_icon {
                display: none;
            }
        }
    }
    .dp__outer_menu_wrap {
        left: 0 !important;
    }
}
</style>
