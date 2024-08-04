<script setup lang="ts">
import { ref } from "vue";
import { onClickOutside } from "@vueuse/core";

interface Props {
  regions: any;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (
    e: "setDepartment",
    payload: { department_name: string; url_part: string }
  ): void;
  (
    e: "setRegion",
    payload: {
      region_name: string;
      url_part: string;
    }
  ): void;
}>();

const target = ref(null);

const regionsList = ref(props.regions);
const selectedRegion = ref();

const departmentsList = ref();

const displayRegion = ref(false);
const displayDepartment = ref(false);

const filterBy = ref("default");

const regionLabel = ref("Filtrer par région");
const departmentLabel = ref("Filtrer par département");

const handleRegion = (region: any) => {
  displayRegion.value = false;
  selectedRegion.value = region;
  departmentLabel.value = "Filtrer par département";
  departmentsList.value = selectedRegion.value.departments;
  if (filterBy.value === "default" || filterBy.value !== region.region_name) {
    filterBy.value = region;
    regionLabel.value = region.region_name;

    const regionData = {
      region_name: region.region_name,
      url_part: region.url_part,
    };
    emit("setRegion", regionData);
  } else {
    regionLabel.value = "Filtrer par région";
  }
};

const handleDepartment = (department: any) => {
  displayDepartment.value = false;
  if (
    filterBy.value === "default" ||
    filterBy.value !== department.department_name
  ) {
    filterBy.value = department;
    departmentLabel.value = department.department_name;

    const departmentData = {
      department_name: department.department_name,
      url_part: department.url_part,
    };
    emit("setDepartment", departmentData);
  } else {
    departmentLabel.value = "Filtrer par département";
  }
};

onClickOutside(target, (event) => (displayRegion.value = false));
onClickOutside(target, (event) => (displayDepartment.value = false));
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
        <div class="list" ref="target">
          <span
            class="list__element"
            v-for="region in regionsList"
            :key="region.region_name"
            :class="{
              disabled: filterBy.region_name === region.region_name,
            }"
            @click="handleRegion(region)"
            >{{ region.region_name }}</span
          >
        </div>
      </div>
    </div>
  </div>

  <div v-if="selectedRegion" class="filtering">
    <div class="filtering__dropdown">
      <span
        class="filtering__dropdown__label"
        :class="{
          'filtering__dropdown__label--active':
            departmentLabel !== 'Filtrer par département',
        }"
        @click="displayDepartment = !displayDepartment"
        >{{ departmentLabel }}</span
      >
      <div class="wrapper" v-if="displayDepartment">
        <div class="list" ref="target">
          <span
            class="list__element"
            v-for="department in departmentsList"
            :key="department.department_name"
            :class="{
              disabled: filterBy.department_name === department.department_name,
            }"
            @click="handleDepartment(department)"
            >{{ department.department_name }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.filtering {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
  max-width: 400px;

  &__dropdown {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background-color: $primary-color;
    border-radius: $radius;
    width: 100%;
    max-width: 400px;

    &__label {
      cursor: pointer;
      padding: 0.5rem 1rem;
      border: 2px solid transparent;
      border-radius: $radius;
      width: 100%;
      max-width: 400px;

      &--active {
        color: $secondary-color;
        border: 2px solid $primary-color;
        font-weight: $skinny-thick;
      }
    }

    .wrapper {
      display: flex;
      position: absolute;
      margin-top: 2.05rem;
      z-index: 1;
      width: 100%;
      max-width: 400px;

      .list {
        background-color: $primary-color;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
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
