<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useDeathStore } from "@/stores/deathsStore";
// import { useAccountStore } from "@/stores/accountStore";
import { onClickOutside } from "@vueuse/core";
import {
  checkExistingToken,
  removeCredits,
  getCredits,
  fetchCitiesList,
} from "@/utils/supabase";
import { useRoute, useRouter } from "vue-router";
import { computedAsync, useToggle } from "@vueuse/core";

const [showCreditsPopUp, toggleCreditsPopUp] = useToggle();

const target = ref(null);
const showDate = ref(false);
const showRegion = ref(false);
const showDepartment = ref(false);
const showCity = ref(false);
onClickOutside(target, (event) => (showDate.value = false));
onClickOutside(target, (event) => (showRegion.value = false));
onClickOutside(target, (event) => (showDepartment.value = false));
onClickOutside(target, (event) => (showCity.value = false));

const route = useRoute();
const router = useRouter();
const deathStore = useDeathStore();
// const accountStore = useAccountStore();
const loading = ref(false);

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

const departmentsList = ref([]);
const citiesList = ref([]);

onMounted(async () => {
  loading.value = true;
  isUserLoggedIn.value = await checkExistingToken();
  if (!isUserLoggedIn.value) {
    await router.push({ path: "/" });
    return;
  }
  await deathStore.getAllDeadPeople();
  const { region, department, city } = route.query;

  if (region) {
    deathStore.setRegion(region as string);
    departmentsList.value = deathStore.regions.find(
      (r) => r.region_name === region
    )?.departments;
  }
  if (department) {
    deathStore.setDepartment(department as string);
    citiesList.value = await fetchCitiesList(department as string);
  }
  if (city) deathStore.setCity(city as string);

  await fetchAndUpdateRecords();
  loading.value = false;
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
  setTimeout(() => {
    showDate.value = false;
  }, 400);
}

async function handleDepartmentFilter(filter: {
  department_name: string;
  url_part: string;
}) {
  deathStore.setDepartment(filter.department_name);
  deathStore.setCity("");
  updateUrl();
  citiesList.value = await fetchCitiesList(filter.department_name);
}

function handleRegionFilter(filter: { region_name: string; url_part: string }) {
  deathStore.setRegion(filter.region_name);
  departmentsList.value = filter.departments;
  deathStore.setDepartment("");
  deathStore.setCity("");
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
  setSliceInStore([0, 200]);
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
  if (userCredits.value < selectedRecords.value.length) {
    toggleCreditsPopUp();
    return;
  }
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

    buttonState.value = "success";
    localStorage.setItem("notification", "true");
    setTimeout(
      () => {
        location.reload();
      },

      2000
    );
  } catch (error) {
    console.error("Failed to unlock profiles and deduct credits:", error);
  }
}

const isMobile = computed(() => window.innerWidth < 768);

useHead({
  title: "MartinImmo | Recherchez des biens à vendre",
  meta: [
    {
      name: "description",
      content:
        "Rentrez en contact avec des millions de particuliers cherchant à vendre, nettoyer ou débarasser un bien immobillier. 10 crédits offers et 10 crédits suplémentaires en renseignant le code de votre parrain à l'inscription.",
    },
    {
      property: "og:title",
      content: "MartinImmo | Recherchez des biens à vendre",
    },
    {
      property: "og:description",
      content: `Rentrez en contact avec des millions de particuliers cherchant à vendre, nettoyer ou débarasser un bien immobillier. 
  10 crédits offers et 10 crédits suplémentaires en renseignant le code de votre parrain à l'inscription.`,
    },
    {
      property: "og:url",
      content: `https://martinimmo.netlify.app${route.path}`,
    },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "fr_FR" },
  ],
});
</script>

<template>
  <template v-if="buttonState === 'success'">
    <span class="moving-notification"
      ><IconComponent icon="mail" color="#9600de"
    /></span>
    <span class="moving-notification"
      ><IconComponent icon="at-sign" color="#9600de"
    /></span>
    <span class="moving-notification"
      ><IconComponent icon="info" color="#9600de" /></span
  ></template>

  <template v-if="isUserLoggedIn?.user.aud && !loading">
    <!-- <Container>
      <Transition name="expand">
        <div class="sorting-and-filtering">
          <Filtering
            :regions="deathStore.regions"
            @set-department="handleDepartmentFilter"
            @set-region="handleRegionFilter"
            @set-city="handleCityFilter"
            v-if="isMobile"
          />

          <PrimaryButton
            v-if="
              selectedRecords.length > 0 &&
              selectedRecords.length <= userCredits
            "
            @click="savePersons"
            :buttonState
            >Débloquer {{ selectedRecords.length }} contact(s)</PrimaryButton
          >
          <PrimaryButton
            v-else-if="
              selectedRecords.length > 0 && selectedRecords.length > userCredits
            "
            @click="toggleCreditsPopUp"
            :buttonState
            >Débloquer {{ selectedRecords.length }} contact(s)</PrimaryButton
          >
          <ConfirmationPopUp
            v-if="showCreditsPopUp"
            @closeConfirmation="toggleCreditsPopUp"
          >
            Vous n'avez pas assez de crédits
            <template #button>
              <NuxtLink to="/credits" class="button primary--dark">
                Acheter des crédits
              </NuxtLink>
            </template>
          </ConfirmationPopUp>
        </div></Transition
      >
    </Container> -->
    <Container>
      <Transition name="expand">
        <div class="sorting-and-filtering">
          <Filtering
            :regions="deathStore.regions"
            @set-department="handleDepartmentFilter"
            @set-region="handleRegionFilter"
            @set-city="handleCityFilter"
            v-if="isMobile"
          />
          <!-- <Sorting :order="sortOrder" @sort-by="handleSort" /> -->

          <PrimaryButton
            v-if="
              selectedRecords.length > 0 &&
              selectedRecords.length <= userCredits
            "
            @click="savePersons"
            :buttonState
            >Débloquer {{ selectedRecords.length }} contact(s)</PrimaryButton
          >
          <PrimaryButton
            v-else-if="
              selectedRecords.length > 0 && selectedRecords.length > userCredits
            "
            @click="toggleCreditsPopUp"
            :buttonState
            >Débloquer {{ selectedRecords.length }} contact(s)</PrimaryButton
          >
          <ConfirmationPopUp
            v-if="showCreditsPopUp"
            @closeConfirmation="toggleCreditsPopUp"
          >
            Vous n'avez pas assez de crédits
            <template #button>
              <NuxtLink to="/credits" class="button primary--dark">
                Acheter des crédits
              </NuxtLink>
            </template>
          </ConfirmationPopUp>
        </div></Transition
      >
      <div class="table">
        <div class="table__header" ref="target">
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

          <div class="table__header__cell" @click="showDate = !showDate">
            <IconComponent icon="clock" color="#232323" />Date de décès

            <span
              class="table__header__cell__button"
              :class="{
                'table__header__cell__button--active': showDate,
              }"
            >
              <IconComponent icon="chevron-up" color="#232323" />
            </span>

            <ul class="table__header__cell__options" v-if="showDate">
              <li
                @click="handleSort('date-latest')"
                :class="{ disabled: sortOrder === 'date-latest' }"
              >
                Les plus récents
              </li>
              <li
                @click="handleSort('date-oldest')"
                :class="{ disabled: sortOrder === 'date-oldest' }"
              >
                Les plus anciens
              </li>
            </ul>
          </div>
          <div
            class="table__header__cell"
            v-if="!isMobile"
            @click="showRegion = !showRegion"
          >
            <IconComponent icon="map-pin" />Région
            <span
              class="table__header__cell__button"
              :class="{
                'table__header__cell__button--active': showRegion,
              }"
            >
              <IconComponent icon="chevron-up" color="#232323" />
            </span>
            <ul class="table__header__cell__options" v-if="showRegion">
              <li
                v-for="region in deathStore.regions"
                :key="region.region_name"
                @click="handleRegionFilter(region)"
                :class="{ disabled: region.region_name === deathStore.region }"
              >
                {{ region.region_name }}
              </li>
            </ul>
          </div>
          <div
            class="table__header__cell"
            v-if="!isMobile"
            @click="showDepartment = !showDepartment"
          >
            <IconComponent icon="map-pin" />Département

            <span
              class="table__header__cell__button"
              :class="{
                'table__header__cell__button--active': showDepartment,
              }"
            >
              <IconComponent icon="chevron-up" color="#232323" />
            </span>
            <ul class="table__header__cell__options" v-if="showDepartment">
              <li
                v-for="department in departmentsList"
                :key="department"
                @click="handleDepartmentFilter(department)"
                :class="{ disabled: department === deathStore.department }"
              >
                {{ department.department_name }}
              </li>
            </ul>
          </div>
          <div class="table__header__cell" @click="showCity = !showCity">
            <IconComponent icon="map-pin" />Commune

            <span
              class="table__header__cell__button"
              :class="{
                'table__header__cell__button--active': showCity,
              }"
            >
              <IconComponent icon="chevron-up" color="#232323" />
            </span>
            <ul
              class="table__header__cell__options"
              v-if="showCity && citiesList.length > 0"
            >
              <li
                v-for="city in citiesList[0].cities"
                :key="city"
                @click="handleCityFilter(city)"
                :class="{ disabled: city === deathStore.city }"
              >
                {{ city }}
              </li>
            </ul>
          </div>
          <!-- <div class="table__header__cell" v-if="!isMobile">
            <IconComponent icon="user" color="#232323" />Prénom
          </div> -->
          <div class="table__header__cell" v-if="!isMobile">
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
      /><span v-else style="font-weight: 300; margin: 0 auto"
        >{{ deathStore.totalDeadPeople }} résultats disponibles</span
      >
    </Container>
    <Container>
      <div class="disclaimer">
        <span class="subtitles">Comment utiliser ces données au mieux ?</span>
        <span
          >Des conseils vous attendent sur notre
          <NuxtLink to="/blog" class="button--tertiary-light">blog</NuxtLink>.
          Vous pouvez aussi
          <NuxtLink to="/mon-compte#scanner" class="button--tertiary-light"
            >tester vos emails</NuxtLink
          >
          avant de les envoyer !</span
        >
      </div>
    </Container>
  </template>

  <SkeletonsSearchSkeleton v-else-if="loading" />
</template>

<style lang="scss">
.moving-notification {
  gap: 0.25rem;
  position: absolute;
  top: 7rem;
  right: 7rem;
  z-index: 4;
  animation: move 1s infinite ease;

  @media (min-width: $big-tablet-screen) {
    top: 6rem;
    right: 7rem;
  }

  &:nth-of-type(2) {
    animation-delay: 1s;
    animation: move 1.5s infinite ease;
  }
  &:nth-of-type(3) {
    animation-delay: 2s;
    animation: move 0.75s infinite ease;
  }
}

@keyframes move {
  from {
    opacity: 0;
    transform: translate(0, 0) rotate(-180deg);
  }
  80% {
    opacity: 1;
    transform: translate(3.5rem, -5rem) rotate(0deg);
  }

  to {
    opacity: 0;
    transform: translate(4.5rem, -4.5rem) rotate(0deg);
  }
}

.sorting-and-filtering {
  display: flex;
  gap: 1rem;
  white-space: nowrap;
  background-color: $secondary-color;
  padding: 1rem;
  border-radius: $radius;
  flex-direction: column;
  min-height: 76px;

  @media (min-width: $big-tablet-screen) {
    flex-direction: row;
    width: 100%;
    position: inherit;
    top: inherit;
  }
}
</style>
