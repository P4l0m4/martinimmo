<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useDeathStore } from "@/stores/deathsStore";
import { checkExistingToken } from "@/utils/supabase";
import { useRoute } from "vue-router";

const route = useRoute();

const deathStore = useDeathStore();

const isUserLoggedIn = ref();

const records = ref([]);
const sortedRecords = ref([]);

const sortOrder = ref("default");

const reset = ref(false);

onMounted(async () => {
  isUserLoggedIn.value = await checkExistingToken();
  if (isUserLoggedIn.value === null) {
    await navigateTo({ path: "/" });
  }
  // await deathStore.fetchData();
  await deathStore.getAllDeadPeople();
  records.value = deathStore.records;
  sortedRecords.value = deathStore.records;

  if (route.query.region) {
    navigateTo(`${route.path}?region=${deathStore.region}`);
    deathStore.setRegion(route.query.region as string);
  }
  if (route.query.department) {
    navigateTo(
      `${route.path}?region=${deathStore.region}&department=${deathStore.department}`
    );
    deathStore.setDepartment(route.query.department as string);
  }
});

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

async function handleDepartmentFilter(filter: {
  department_name: string;
  url_part: string;
}) {
  await deathStore.setDepartment(filter.department_name);
  records.value = deathStore.records;
  sortedRecords.value = deathStore.records;
}

async function handleRegionFilter(filter: {
  region_name: string;
  url_part: string;
}) {
  await deathStore.setRegion(filter.region_name);
  records.value = deathStore.records;
  sortedRecords.value = deathStore.records;
}

function setSliceInStore(slice: [number, number]) {
  deathStore.setSlice(slice);
  records.value = deathStore.records;
  sortedRecords.value = deathStore.records;
}

//watch for changes on the region of the store
watch(
  () => deathStore.records,
  (newRegion) => {
    if (newRegion) {
      records.value = deathStore.records;
      sortedRecords.value = deathStore.records;
    }
  }
);

//reset the pagination when the region changes
watch(
  () => deathStore.region,
  () => {
    navigateTo(`${route.path}?region=${deathStore.region}`);
    deathStore.setDepartment("");
    deathStore.setSlice([0, 200]);
    records.value = deathStore.records;
    sortedRecords.value = deathStore.records;
    reset.value = true;
    setTimeout(() => {
      reset.value = false;
    }, 100);
  }
);

watch(
  () => deathStore.department,
  () => {
    navigateTo(
      `${route.path}?region=${deathStore.region}&department=${deathStore.department}`
    );
    deathStore.setSlice([0, 200]);
    records.value = deathStore.records;
    sortedRecords.value = deathStore.records;
    reset.value = true;
    setTimeout(() => {
      reset.value = false;
    }, 100);
  }
);
</script>

<template>
  <template v-if="isUserLoggedIn?.user.aud">
    <Container>
      <div class="sorting-and-filtering">
        <Filtering
          :regions="deathStore.regions"
          @set-department="handleDepartmentFilter"
          @set-region="handleRegionFilter"
        />
        <Sorting :order="sortOrder" @sort-by="handleSort" />
      </div>
      <div class="cards">
        <ProfileCard
          v-for="(sortedRecord, i) in sortedRecords"
          :key="i"
          :id="sortedRecord.id"
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
          :uuid="sortedRecord.id"
        /></div
    ></Container>
    <Container>
      <PaginationComponent
        :totalDeadPeople="deathStore.totalDeadPeople"
        @slice-selected="setSliceInStore"
        v-if="deathStore.totalDeadPeople > 200 && !reset"
      />
    </Container>
  </template>

  <SkeletonsSearchSkeleton v-else />
</template>

<style scoped lang="scss">
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(343px, 1fr));
  width: 100%;
  gap: 1rem;
  margin-top: 104px;
}

.sorting-and-filtering {
  position: fixed;
  z-index: 2;
  top: 104px;
  left: 0;
  right: 0;
  margin: auto;
  display: flex;
  gap: 1rem;
  white-space: nowrap;
  background-color: $secondary-color;
  padding: 1rem;
  border-radius: $radius;
  flex-direction: column;
  width: calc(100% - 2rem);

  @media (min-width: $big-tablet-screen) {
    flex-direction: row;
    width: calc(100% - 4rem);
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
