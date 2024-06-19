<script setup lang="ts">
import { ref, watch } from "vue";

type SortOrder = "default" | "date-latest" | "date-oldest";

const sortBy = ref<SortOrder>("default");

const emit = defineEmits<{ (e: "sort-by", order: SortOrder): void }>();

const props = defineProps<{ order: SortOrder }>();

watch(
  () => props.order,
  (value) => {
    sortBy.value = value;
  }
);

const handleSort = (order: SortOrder) => {
  sortBy.value = sortBy.value === order ? "default" : order;
  emit("sort-by", sortBy.value);
};
</script>

<template>
  <div class="sorting">
    <button
      class="sorting__button"
      :class="{ 'sorting__button--active': sortBy === 'date-latest' }"
      @click="handleSort('date-latest')"
    >
      Les plus récents
    </button>
    <button
      class="sorting__button"
      :class="{ 'sorting__button--active': sortBy === 'date-oldest' }"
      @click="handleSort('date-oldest')"
    >
      Les plus anciens
    </button>
  </div>
</template>

<style scoped lang="scss">
.sorting {
  display: flex;
  gap: 0.5rem;
  align-items: center;

  &__button {
    background-color: $primary-color;
    border: 2px solid $primary-color;
    border-radius: 0.5rem;
    color: $text-color;
    cursor: pointer;
    padding: 0.5rem 1rem;
    transition: background-color 0.3s ease, border-color 0.3s ease,
      color 0.3s ease;

    &--active {
      color: $secondary-color;
      border: 2px solid $secondary-color;
    }
  }
}
</style>
