import { ref, onMounted, watch } from 'vue';

export function useLocalStorage<T>(key: string, defaultValue: T) {
    const data = ref<T>(defaultValue);

    function getItem(): void {
        const value = localStorage.getItem(key);
        if (value) data.value = JSON.parse(value);
    }

    function saveData(): void {
        localStorage.setItem(key, JSON.stringify(data.value));
    }

    onMounted(() => {
        getItem();
        watch(
            data,
            () => {
                saveData();
            },
            { deep: true }
        );
    });

    return data;
}
