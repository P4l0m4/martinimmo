<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useDeathStore } from "@/stores/deathsStore";
const deathStore = useDeathStore();

const regionsList = ref([]);
const departmentsList = ref([]);

const displayRegion = ref(false);
const displayDepartement = ref(false);

const filterBy = ref("default");
const emit = defineEmits(["filter-by"]);

const props = defineProps(["order"]);

watch(
  () => props.order,
  (value) => {
    if (value === "default") {
      regionLabel.value = "Filtrer par région";
      departementLabel.value = "Filtrer par département";
    } else {
      if (regionsList.value.includes(value)) {
        regionLabel.value = value;
        departementLabel.value = "Filtrer par département";
      } else {
        departementLabel.value = value;
        regionLabel.value = "Filtrer par région";
      }
    }
  }
);

const handleFilter = (order: string, type) => {
  displayDepartement.value = false;
  displayRegion.value = false;
  if (filterBy.value === "default") {
    filterBy.value = order;
    emit("filter-by", filterBy.value);

    if (type === "region") {
      regionLabel.value = order;
      departementLabel.value = "Filtrer par département";
    } else {
      departementLabel.value = order;
      regionLabel.value = "Filtrer par région";
    }
  } else {
    filterBy.value = "default";

    emit("filter-by", filterBy.value);

    if (type === "region") {
      regionLabel.value = "Filtrer par région";
    } else {
      departementLabel.value = "Filtrer par département";
    }
  }
};

const regionLabel = ref("Filtrer par région");
const departementLabel = ref("Filtrer par département");

onMounted(async () => {
  await deathStore.fetchData();
  regionsList.value = deathStore.records.map(
    (record) => record.current_death_reg_name
  );
  departmentsList.value = deathStore.records.map((record) => {
    return {
      name: record.current_death_dep_name,
      code: record.current_death_dep_code,
    };
  });
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
        @click="(displayRegion = !displayRegion), (displayDepartement = false)"
        >{{ regionLabel }}</span
      >
      <div class="filtering__dropdown__list" v-if="displayRegion">
        <span
          class="filtering__dropdown__list__element"
          v-for="region in regionsList"
          :key="region"
          @click="handleFilter(region, 'region')"
          >{{ region }}</span
        >
      </div>
    </div>
    <div class="filtering__dropdown">
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
    </div>
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
      position: relative;
      padding: 0.5rem 1rem;
      border: 2px solid transparent;
      border-radius: $radius;

      &--active {
        color: $secondary-color;
        border: 2px solid $secondary-color;
      }
    }

    &__list {
      background-color: $primary-color;
      margin-top: 2rem;
      position: absolute;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      &__element {
        cursor: pointer;
        padding: 0.5rem 1rem;
      }
    }
  }
}
</style>
