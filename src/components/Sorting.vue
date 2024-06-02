<script setup lang="ts">
import { ref, watch } from "vue";

const sortBy = ref("default");
const emit = defineEmits(["sort-by"]);
const props = defineProps(["order"]);

watch(
  () => props.order,
  (value) => {
    sortBy.value = value;
  }
);

const handleSort = (order: string) => {
  if (sortBy.value === "default") {
    sortBy.value = order;
    emit("sort-by", sortBy.value);
  } else {
    sortBy.value = "default";
    emit("sort-by", sortBy.value);
  }
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

    &--active {
      color: $secondary-color;
      border: 2px solid $secondary-color;
    }
  }
}
</style>
