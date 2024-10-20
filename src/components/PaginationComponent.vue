<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
const props = defineProps<{
  totalDeadPeople: number;
}>();

const emit = defineEmits(["slice-selected"]);

const sliceSize = 200;
const selectedSliceIndex = ref(0);

const slices = computed(() => {
  const ranges = [];
  for (let i = 0; i < props.totalDeadPeople; i += sliceSize) {
    ranges.push({
      start: i,
      end: Math.min(i + sliceSize, props.totalDeadPeople) - 1,
    });
  }
  return ranges;
});

function selectSlice(index: number) {
  selectedSliceIndex.value = index;

  //if more than 20 slices, don't scroll
  if (slices.value.length > 15 && index > slices.value.length - 10) {
    return;
  } else if (slices.value.length > 25 && index > slices.value.length - 15) {
    return;
  }
  document.querySelectorAll(".pagination-button")[index].scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "center",
  });

  emit("slice-selected", [slices.value[index].start, slices.value[index].end]);
}

function nextSlice() {
  if (selectedSliceIndex.value < slices.value.length - 1) {
    selectSlice(selectedSliceIndex.value + 1);
  }
}

function prevSlice() {
  if (selectedSliceIndex.value > 0) {
    selectSlice(selectedSliceIndex.value - 1);
  }
}

onMounted(() => {
  selectedSliceIndex.value = 0;
});
</script>

<template>
  <div class="pagination">
    <div class="wrapper">
      <button class="arrow" @click="prevSlice">
        <IconComponent icon="chevron-up" size="1.5rem" />
      </button>
      <ul>
        <li v-for="(slice, index) in slices" :key="slice.start">
          <button
            @click="selectSlice(index)"
            class="pagination-button"
            :class="{
              'pagination-button--selected': selectedSliceIndex === index,
            }"
          >
            {{ index + 1 }}
          </button>
        </li>
      </ul>
      <button class="arrow" @click="nextSlice">
        <IconComponent icon="chevron-up" size="1.5rem" />
      </button>
    </div>
    <span
      class="pagination__results"
      v-if="totalDeadPeople !== 3000 && totalDeadPeople !== 6000"
      >{{ totalDeadPeople }} résultats disponibles</span
    >
  </div>
</template>

<style scoped lang="scss">
.arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  transform: rotate(90deg);
  display: none;

  &:nth-of-type(1) {
    transform: rotate(-90deg);
  }

  @media (min-width: $laptop-screen) {
    display: flex;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-direction: column;

  .wrapper {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    overflow-x: hidden;
    max-width: 100%;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  ul {
    display: flex;
    gap: 0.5rem;
    list-style: none;
    max-width: 100%;
    overflow-x: scroll;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__results {
    font-weight: 300;
  }

  &-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background-color: $primary-color;
    box-shadow: $shadow-black;
    font-weight: 500;
    color: $text-color !important;
    transition: background-color 0.3s;
  }

  &-button--selected {
    background-color: $secondary-color;
    color: $text-color-alt !important;
  }
}
</style>
