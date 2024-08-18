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
const isDesktop = computed(() => window.innerWidth > 1024);

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

  if (window.innerWidth > 1024) {
    showMenu.value = true;
  }

  boxArray.value = Array(sortedRecords.value.length).fill(false);
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
import { useToggle, onClickOutside } from "@vueuse/core";
const target = ref<HTMLElement | null>(null);
onClickOutside(target, () => toggleMenu());

const [showMenu, toggleMenu] = useToggle();

const boxArray = ref<boolean[]>([]);

function updateBox(index: number, newValue: boolean) {
  boxArray.value.splice(index, 1, !newValue);
}

const isBoxChecked = ref(false);

function selectTenBoxes() {
  if (isBoxChecked.value === false) {
    // Set the first 10 elements to true
    boxArray.value = boxArray.value.map((_, i) =>
      i < 10 ? true : boxArray.value[i]
    );
    isBoxChecked.value = true;
  } else {
    // Set the first 10 elements to false
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
  if (!isUserLoggedIn?.value || selectedRecords.value.length === 0) {
    return;
  }
  try {
    await addDeadPersonInfoToDB(
      isUserLoggedIn?.value.user.id,
      selectedRecords.value
    );
  } catch (error) {
    console.error("Failed to add family member info:", error);
  }
  for (let i = 0; i < selectedRecords.value.length; i++) {
    await updateUnlockedStatusOfDeceasedPerson(selectedRecords.value[i].id);
    console.log(selectedRecords.value[i].id);
  }
}
</script>

<template>
  <template v-if="isUserLoggedIn?.user.aud">
    <Container>
      <Transition>
        <MenuButton v-if="!showMenu" @click="toggleMenu()" />
      </Transition>
      <Transition name="expand">
        <div
          class="sorting-and-filtering"
          v-if="showMenu || isDesktop"
          ref="target"
        >
          <Filtering
            :regions="deathStore.regions"
            @set-department="handleDepartmentFilter"
            @set-region="handleRegionFilter"
          />
          <Sorting :order="sortOrder" @sort-by="handleSort" />
          <PrimaryButton @click="savePersons"
            >Débloquer {{ selectedRecords.length }} contact(s)</PrimaryButton
          >
        </div></Transition
      >
    </Container>
    <Container>
      <table class="table">
        <thead>
          <tr>
            <th class="table__header">
              <span
                class="checkbox"
                :class="{ 'checkbox--checked': isBoxChecked }"
                v-tooltip:right="'En sélectionner 10'"
                @click="selectTenBoxes"
                ><IconComponent
                  :icon="`check`"
                  color="#fffdfa"
                  v-if="isBoxChecked"
              /></span>
            </th>
            <th class="table__header">
              <IconComponent icon="clock" color="#232323" /> Date de décès
            </th>
            <th class="table__header">
              <IconComponent icon="map-pin" /> Ville
            </th>
            <th class="table__header">
              <IconComponent icon="user" color="#232323" /> Prénom
            </th>
            <th class="table__header">
              <IconComponent icon="user" color="#232323" /> Nom
            </th>
          </tr>
        </thead>
        <tbody class="table__body">
          <ProfileCard
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
        </tbody>
      </table>
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
  z-index: 1;
  display: flex;
  gap: 1rem;
  white-space: nowrap;
  background-color: $secondary-color;
  padding: 1rem;
  border-radius: $radius;
  flex-direction: column;
  width: calc(100% - 2rem);
  position: fixed;
  top: 6rem;

  @media (min-width: $big-tablet-screen) {
    flex-direction: row;
    width: 100%;
    position: inherit;
    top: inherit;
  }
}
</style>
