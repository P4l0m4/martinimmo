<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useDeathStore } from "@/stores/deathsStore";
import {
  checkExistingToken,
  removeCredits,
  getCredits,
} from "@/utils/supabase";
import { useRoute, useRouter } from "vue-router";
import { computedAsync } from "@vueuse/core";

const route = useRoute();
const router = useRouter();
const deathStore = useDeathStore();

const isUserLoggedIn = ref();
const records = ref([]);
const sortedRecords = ref([]);
const sortOrder = ref("default");
const reset = ref(false);
const buttonState = ref("");
const boxArray = ref<boolean[]>([]);
const isBoxChecked = ref(false);

const userCredits = computedAsync(async () => {
  if (isUserLoggedIn.value) {
    const credits = await getCredits(isUserLoggedIn.value.user.id);
    return credits.credits;
  }
  return 0;
}, 0);

async function fetchAndUpdateRecords() {
  records.value = Array.from(deathStore.records);
  sortedRecords.value = Array.from(deathStore.records);
  boxArray.value = Array(sortedRecords.value.length).fill(false);
}

onMounted(async () => {
  isUserLoggedIn.value = await checkExistingToken();
  if (!isUserLoggedIn.value) {
    await router.push({ path: "/" });
    return;
  }
  await deathStore.getAllDeadPeople();
  const { region, department, city } = route.query;

  if (region) deathStore.setRegion(region as string);
  if (department) deathStore.setDepartment(department as string);
  if (city) deathStore.setCity(city as string);

  await fetchAndUpdateRecords();
});

function handleSort(order: string) {
  sortOrder.value = order;
  if (order === "default") {
    sortedRecords.value = Array.from(records.value);
  } else if (order === "date-latest") {
    sortedRecords.value = Array.from(records.value).sort((a, b) =>
      a.death_date > b.death_date ? -1 : 1
    );
  } else if (order === "date-oldest") {
    sortedRecords.value = Array.from(records.value).sort((a, b) =>
      a.death_date < b.death_date ? -1 : 1
    );
  }
}

function handleDepartmentFilter(filter: {
  department_name: string;
  url_part: string;
}) {
  deathStore.setDepartment(filter.department_name);
  updateUrl();
}

function handleRegionFilter(filter: { region_name: string; url_part: string }) {
  deathStore.setRegion(filter.region_name);
  updateUrl();
}

function handleCityFilter(filter: string) {
  deathStore.setCity(filter);
  updateUrl();
}

function updateUrl() {
  const queryParams = {
    region: deathStore.region || "",
    department: deathStore.department || "",
    city: deathStore.city || "",
  };

  const query = Object.entries(queryParams)
    .filter(([_, value]) => value) // remove empty query params
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  router.push(`${route.path}?${query}`);

  fetchAndUpdateRecords();
}

function setSliceInStore(slice: [number, number]) {
  deathStore.setSlice(slice);
  fetchAndUpdateRecords();
}

watch(
  () => deathStore.records,
  (newRecords) => {
    records.value = Array.from(newRecords);
    sortedRecords.value = Array.from(newRecords);
    boxArray.value = Array(sortedRecords.value.length).fill(false);
  },
  { immediate: true }
);

watch(
  [() => deathStore.region, () => deathStore.department, () => deathStore.city],
  updateUrl
);

function updateBox(index: number, newValue: boolean) {
  boxArray.value.splice(index, 1, !newValue);
}

function selectTenBoxes() {
  if (!isBoxChecked.value) {
    boxArray.value = boxArray.value.map((_, i) =>
      i < 10 ? true : boxArray.value[i]
    );
    isBoxChecked.value = true;
  } else {
    boxArray.value = boxArray.value.map((_, i) =>
      i < deathStore.slice[1] ? false : boxArray.value[i]
    );
    isBoxChecked.value = false;
  }
}

const selectedRecords = computed(() =>
  boxArray.value
    .map((value, index) => (value ? sortedRecords.value[index] : null))
    .filter((record) => record)
);
async function savePersons() {
  if (!isUserLoggedIn?.value || selectedRecords.value.length === 0) return;

  try {
    // Save the selected records to the database
    await addDeadPersonInfoToDB(
      isUserLoggedIn?.value.user.id,
      selectedRecords.value
    );

    // Update the unlocked status for each selected record
    for (let record of selectedRecords.value) {
      await updateUnlockedStatusOfDeceasedPerson(record.id);
    }

    // Remove credits only once based on the total number of selected records
    await removeCredits(
      isUserLoggedIn?.value.user.id,
      selectedRecords.value.length
    );

    // Indicate success
    buttonState.value = "success";
    setTimeout(() => location.reload(), 1000);
  } catch (error) {
    console.error("Failed to unlock profiles and deduct credits:", error);
  }
}
</script>

<template>
  <template v-if="isUserLoggedIn?.user.aud">
    <Container>
      <Transition name="expand">
        <div class="sorting-and-filtering" ref="target">
          <Filtering
            :regions="deathStore.regions"
            @set-department="handleDepartmentFilter"
            @set-region="handleRegionFilter"
            @set-city="handleCityFilter"
          />
          <Sorting :order="sortOrder" @sort-by="handleSort" />
          <PrimaryButton
            v-if="userCredits > 0"
            @click="savePersons"
            :buttonState
            >Débloquer {{ selectedRecords.length }} contact(s)</PrimaryButton
          >
        </div></Transition
      >
    </Container>
    <Container>
      <div class="table">
        <div class="table__header">
          <div>
            <span
              class="checkbox"
              :class="{ 'checkbox--checked': isBoxChecked }"
              @click="selectTenBoxes"
              ><IconComponent
                :icon="`check`"
                color="#fffdfa"
                v-if="isBoxChecked"
            /></span>
          </div>
          <div class="table__header__cell">
            <IconComponent icon="clock" color="#232323" />Date de décès
          </div>
          <div class="table__header__cell">
            <IconComponent icon="map-pin" />Commune
          </div>
          <div class="table__header__cell">
            <IconComponent icon="user" color="#232323" />Prénom
          </div>
          <div class="table__header__cell">
            <IconComponent icon="user" color="#232323" />Nom
          </div>
        </div>
        <div class="table__body">
          <ProfileTableRow
            v-for="(sortedRecord, i) in sortedRecords"
            :key="i"
            :id="sortedRecord.id"
            v-model:box="boxArray[i]"
            @update-box="updateBox(i, $event)"
            :sex="sortedRecord.sex"
            :name="{
              first: sortedRecord.firstnames,
              last: sortedRecord.lastname,
            }"
            :death="{
              age: sortedRecord.age,
              date: sortedRecord.death_date,
              city: sortedRecord.current_death_com_name,
              departmentCode: sortedRecord.current_death_dep_code,
              departmentName: sortedRecord.current_death_dep_name,
              regionName: sortedRecord.current_death_reg_name,
            }"
            :uuid="sortedRecord.id"
            :index="i"
            :box-array="boxArray"
          />
        </div>
      </div>
    </Container>
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
.sorting-and-filtering {
  display: flex;
  gap: 1rem;
  white-space: nowrap;
  background-color: $secondary-color;
  padding: 1rem;
  border-radius: $radius;
  flex-direction: column;

  @media (min-width: $big-tablet-screen) {
    flex-direction: row;
    width: 100%;
    position: inherit;
    top: inherit;
  }
}
</style>
