<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useDeathStore } from "@/stores/deathsStore";
const deathStore = useDeathStore();

const regionsList = deathStore.regions;

const displayRegion = ref(false);

const filterBy = ref("default");

const regionLabel = ref("Filtrer par région");

const handleFilter = (region) => {
  displayRegion.value = false;
  if (filterBy.value === "default" || filterBy.value !== region.region_name) {
    filterBy.value = region;
    regionLabel.value = region.region_name;

    const regionData = {
      region_name: region.region_name,
      url_part: region.url_part,
    };
    deathStore.setRegion(regionData);
  } else {
    regionLabel.value = "Filtrer par région";
  }
};

// function closeDropdown() {
//   displayRegion.value = false;
//   console.log("closeDropdown");
// }

onMounted(async () => {
  await deathStore.fetchData();
});
</script>
<template>
  <div class="filtering">
    <div class="filtering__dropdown">
      <span
        class="filtering__dropdown__label"
        :class="{
          'filtering__dropdown__label--active':
            regionLabel !== 'Filtrer par région',
        }"
        @click="displayRegion = !displayRegion"
        >{{ regionLabel }}</span
      >
      <div class="wrapper" v-if="displayRegion">
        <div class="list">
          <span
            class="list__element"
            v-for="region in regionsList"
            :key="region.region_name"
            :class="{
              disabled: filterBy.region_name === region.region_name,
            }"
            @click="handleFilter(region)"
            >{{ region.region_name }}</span
          >
        </div>
      </div>
    </div>
    <!-- <div class="filtering__dropdown">
      <span
        class="filtering__dropdown__label"
        :class="{
          'filtering__dropdown__label--active':
            departementLabel !== 'Filtrer par département',
        }"
        @click="
          (displayDepartement = !displayDepartement), (displayRegion = false)
        "
        >{{ departementLabel }}</span
      >
      <div class="filtering__dropdown__list" v-if="displayDepartement">
        <span
          class="filtering__dropdown__list__element"
          v-for="department in departmentsList"
          :key="department.name"
          @click="handleFilter(department.name, 'department')"
          >{{ department.name }} ({{ department.code }})</span
        >
      </div>
    </div> -->
  </div>
</template>
<style scoped lang="scss">
.filtering {
  display: flex;
  gap: 0.5rem;
  align-items: center;

  &__dropdown {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background-color: $primary-color;
    border-radius: $radius;

    &__label {
      cursor: pointer;
      padding: 0.5rem 1rem;
      border: 2px solid transparent;
      border-radius: $radius;
      width: 230px;

      &--active {
        color: $secondary-color;
        border: 2px solid $secondary-color;
      }
    }
    .wrapper {
      display: flex;
      position: fixed;
      margin-top: 2.5rem;
      z-index: 1;

      .list {
        background-color: $primary-color;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 230px;
        max-height: 50svh;
        overflow-y: scroll;
        box-shadow: $shadow-black;

        &__element {
          cursor: pointer;
          padding: 0.5rem 1rem;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
