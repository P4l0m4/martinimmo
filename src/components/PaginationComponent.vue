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
    <ul>
      <button class="arrow" @click="prevSlice">
        <IconComponent icon="chevron-up" size="1.5rem" />
      </button>
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
      <button class="arrow" @click="nextSlice">
        <IconComponent icon="chevron-up" size="1.5rem" />
      </button>
    </ul>

    <span class="pagination__results"
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
    transition: background-color 0.3s;
  }

  &-button--selected {
    background-color: $secondary-color;
    color: $text-color-alt;
  }
}
</style>
