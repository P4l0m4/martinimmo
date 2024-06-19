<script setup lang="ts">
import { ref, onMounted, watchEffect } from "vue";
import { useDeathStore } from "@/stores/deathsStore";
import { checkExistingToken } from "@/utils/supabase";

const deathStore = useDeathStore();

const isUserLoggedIn = ref();

const records = ref([]);
const sortedRecords = ref([]);

const sortOrder = ref("default");

function handleSort(order: string) {
  sortOrder.value = order;
  if (order === "default") {
    sortedRecords.value = [...records.value];
  } else if (order === "date-latest") {
    sortedRecords.value = [...records.value].sort((a, b) =>
      a.death_date > b.death_date ? -1 : 1
    );
  } else if (order === "date-oldest") {
    sortedRecords.value = [...records.value].sort((a, b) =>
      a.death_date < b.death_date ? -1 : 1
    );
  }
}

watchEffect(() => {
  records.value = deathStore.records;
  sortedRecords.value = [...records.value];
  handleSort(sortOrder.value); // Apply the current sort order to the new records
});

onMounted(async () => {
  await deathStore.fetchData();
  isUserLoggedIn.value = await checkExistingToken();
});
</script>

<template>
  <template v-if="isUserLoggedIn?.user.aud">
    <Skeleton />
    <Container>
      <div class="sorting-and-filtering">
        <Filtering />
        <Sorting @sort-by="handleSort" :order="sortOrder" />

        <!-- <Transition>
        <button
          v-if="sortOrder !== 'default' || filterOrder !== 'default'"
          class="cross"
          @click="resetFiltersAndSort()"
        >
          <IconComponent icon="plus" /></button
      ></Transition> -->
      </div>
      <div class="cards">
        <ProfileCard
          v-for="(sortedRecord, i) in sortedRecords"
          :key="i"
          :sex="sortedRecord.sex"
          :name="{
            first: sortedRecord.firstnames,
            last: sortedRecord.lastname,
          }"
          :death="{
            age: sortedRecord.age,
            date: sortedRecord.death_date,
            departmentCode: sortedRecord.current_death_dep_code,
            departmentName: sortedRecord.current_death_dep_name,
            regionName: sortedRecord.current_death_reg_name,
          }"
        /></div></Container
  ></template>
  <template v-else><MustBeAuthenticated /></template>
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
  white-space: nowrap;
  overflow-x: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
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
