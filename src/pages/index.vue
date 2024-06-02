<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useDeathStore } from "@/stores/deathsStore";

const deathStore = useDeathStore();

const records = ref([]);
const sortedRecords = ref([]);

const sortOrder = ref("default");
const filterOrder = ref("default");

function handleSort(order: string) {
  sortOrder.value = order;
  if (order === "default") {
    sortedRecords.value = records.value;
  } else if (order === "date-latest") {
    sortedRecords.value = records.value.sort((a, b) =>
      a.death_date > b.death_date ? -1 : 1
    );
  } else if (order === "date-oldest") {
    sortedRecords.value = records.value.sort((a, b) =>
      a.death_date < b.death_date ? -1 : 1
    );
  }
}

function handleFilter(order: string) {
  filterOrder.value = order;
  sortedRecords.value = records.value.filter((record) => {
    return (
      record.current_death_reg_name === order ||
      record.current_death_dep_name === order
    );
  });
}

function resetFiltersAndSort() {
  sortOrder.value = "default";
  filterOrder.value = "default";
  sortedRecords.value = records.value;
}

onMounted(async () => {
  await deathStore.fetchData();
  records.value = deathStore.records;
  sortedRecords.value = records.value;
});
</script>
<template>
  <Skeleton />
  <Container>
    <div class="sorting-and-filtering">
      <Sorting @sort-by="handleSort" :order="sortOrder" />
      <Filtering @filter-by="handleFilter" :order="filterOrder" />

      <Transition>
        <button
          v-if="sortOrder !== 'default' || filterOrder !== 'default'"
          class="cross"
          @click="resetFiltersAndSort()"
        >
          <IconComponent icon="plus" /></button
      ></Transition></div
  ></Container>
  <Container>
    <div class="cards">
      <ProfileCard
        v-for="(sortedRecord, i) in sortedRecords"
        :key="i"
        :sex="sortedRecord.sex"
        :name="{ first: sortedRecord.firstnames, last: sortedRecord.lastname }"
        :death="{
          age: sortedRecord.age,
          date: sortedRecord.death_date,
          departmentCode: sortedRecord.current_death_dep_code,
          departmentName: sortedRecord.current_death_dep_name,
          regionName: sortedRecord.current_death_reg_name,
        }"
      />
    </div>
  </Container>
</template>
<style scoped lang="scss">
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  width: 100%;
  gap: 1rem;
}

.sorting-and-filtering {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cross {
  cursor: pointer;
  transform: rotate(45deg);
  background-color: $primary-color;
  height: fit-content;
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  box-shadow: $shadow-black;
}
</style>
