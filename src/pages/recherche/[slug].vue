<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useDeathStore } from "@/stores/deathsStore";
import { stringToSlug } from "@/utils/slugify";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isBetween from "dayjs/plugin/isBetween";
import { fetchPerplexityData, validateEmail } from "@/utils/APIData";
import { generateEmailAddresses } from "@/utils/emailPatterns";
import { normalizeString } from "@/utils/normalize";
import { removeMatchingNames } from "@/utils/dataSanitization";
import { addPerson, fetchPersons, checkExistingToken } from "@/utils/supabase";
import { sleep } from "@/utils/sleep";
import type { Member } from "~/components/FamilyMember.vue";

dayjs.extend(relativeTime);
dayjs.extend(isBetween);

const isUserLoggedIn = ref();
const deathStore = useDeathStore();
const records = ref([]);
const route = useRoute();
const profileSlug = route.params.slug;
const profile = ref();
const formattedDeathDateFromNow = ref();
const formattedDeathDate = ref();
const formattedBirthDate = ref();
const loading = ref(false);

const perplexityFetchingStatus = ref("");
const emailsFetchingStatus = ref("");
const emailsTestingStatus = ref("");

const APIData = ref([]);

const savedMembers = ref<Member[]>([]);

onMounted(async () => {
  loading.value = true;
  isUserLoggedIn.value = await checkExistingToken();
  if (isUserLoggedIn.value === null) {
    await navigateTo({ path: "/" });
  }

  await deathStore.fetchData();
  records.value = deathStore.records;
  await initProfileData();
  savedMembers.value = await fetchDeadPersonInfoFromDB(
    isUserLoggedIn.value.user.id
  );
  loading.value = false;
});

async function initProfileData() {
  profile.value = await fetchDeadPersonById(profileSlug as string);
  formattedDeathDateFromNow.value = dayjs(
    profile.value[0].death_date
  ).fromNow();
  formattedDeathDate.value = dayjs(profile.value[0].death_date).format(
    "DD MMMM YYYY"
  );
  formattedBirthDate.value = dayjs(profile.value[0].birth_date).format(
    "DD MMMM YYYY"
  );

  await loadPersons();
}

async function findFamily() {
  await getDataFromPerplexity();
  getEmailAdresses();
  await testEmailsValidity();
}

async function getDataFromPerplexity() {
  perplexityFetchingStatus.value = "loading";
  try {
    const data = await fetchPerplexityData(
      `first name is ${profile.value[0].firstnames}, last name is ${profile.value[0].lastname}, death date is ${profile.value[0].death_date}, death departement/location is ${profile.value[0].current_death_dep_name}, death city is ${profile.value[0].current_death_com_name}, birth date is ${profile.value[0].birth_date}, birth departement/location is ${profile.value[0].current_birth_dep_name}, this person died at the age of ${profile.value[0].age} years old and was a french citizen.`
    );

    const match = data.choices[0].message.content.match(
      /```json\n([\s\S]*?)\n```/
    );

    if (!match) {
      throw new Error("JSON content not found in response");
    }

    const jsonString = match[1].trim();

    const correctedJsonString = `[${jsonString}]`;

    perplexityFetchingStatus.value = "success";
    APIData.value = JSON.parse(correctedJsonString);
  } catch (error) {
    console.error("Error fetching data:", error);
    perplexityFetchingStatus.value = "error";
  }
}

// async function getDataFromPerplexity() {
//   perplexityFetchingStatus.value = "loading";
//   try {
//     const data = await fetchPerplexityData(
//       `first name is ${profile.value[0].firstnames}, last name is ${profile.value[0].lastname}, death date is ${profile.value[0].death_date}, death departement/location is ${profile.value[0].current_death_dep_name}, death city is ${profile.value[0].current_death_com_name}, birth date is ${profile.value[0].birth_date}, birth departement/location is ${profile.value[0].current_birth_dep_name}, this person died at the age of ${profile.value[0].age} years old and was a french citizen.`
//     );

//     const jsonString = data.choices[0].message.content.match(
//       /```json\n([\s\S]*?)\n```/
//     )[1];
//     console.log("jsonString:", jsonString);
//     perplexityFetchingStatus.value = "success";
//     APIData.value = JSON.parse(jsonString);
//     console.log("APIData:", APIData.value);
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     perplexityFetchingStatus.value = "error";
//   }
// }

const sanitizedAPIData = computed(() => {
  if (!profile.value[0]) return [];

  return removeMatchingNames(
    [...JSON.parse(JSON.stringify(APIData.value))],
    profile.value[0].firstnames,
    profile.value[0].lastname
  );
});

const familyMember = ref([]);

function getEmailAdresses() {
  emailsFetchingStatus.value = "loading";

  if (sanitizedAPIData.value.length > 0) {
    familyMember.value = sanitizedAPIData.value.map((person) => {
      const emails = generateEmailAddresses(
        normalizeString(person.first_name),
        normalizeString(person.last_name)
      );

      return {
        person,
        emails: emails,
      };
    });
    emailsFetchingStatus.value = "success";
  } else {
    console.error("sanitizedAPIData.value is not an array");

    emailsFetchingStatus.value = "error";
  }
}

async function testEmailsValidity() {
  console.log("testing emails");
  emailsTestingStatus.value = "loading";
  const familyMembers = [];
  for (const member of familyMember.value) {
    for (let i = 0; i < member.emails.length; i++) {
      try {
        const response = await validateEmail(member.emails[i]);
        if (response.deliverability === "DELIVERABLE") {
          familyMembers.push({
            person: member.person,
            email: member.emails[i],
          });
          break;
        }
        await sleep(1000);
      } catch (error) {
        console.error("Error:", error);
        emailsTestingStatus.value = "error";
      }
    }
  }
  await addPerson(
    profile.value[0].firstnames,
    profile.value[0].lastname,
    familyMembers
  );
  emailsTestingStatus.value = "success";
  await loadPersons();
}

const allPersonsFromDatabase = ref([]);

async function loadPersons() {
  const data = await fetchPersons();
  allPersonsFromDatabase.value = data;
}

const filteredPersonFromDatabase = computed(() => {
  if (!profile.value || !allPersonsFromDatabase.value) return [];

  return allPersonsFromDatabase.value.filter((person) => {
    return (
      person.firstname === profile.value[0].firstnames &&
      person.lastname === profile.value[0].lastname
    );
  });
});

const displayFamilyResultsFromDatabase = computed(() => {
  if (!toRaw(filteredPersonFromDatabase.value[0])) {
    return false;
  }
  return toRaw(filteredPersonFromDatabase.value[0].family.length) > 0;
});

const displayFamilyButton = computed(() => {
  if (
    toRaw(filteredPersonFromDatabase.value[0]?.family.length) === 0 ||
    toRaw(filteredPersonFromDatabase.value[0]?.family.length) === undefined
  ) {
    return true;
  }

  return false;
});

const displaySteps = computed(() => {
  return (
    displayFamilyButton.value === true &&
    (perplexityFetchingStatus.value === "loading" ||
      perplexityFetchingStatus.value === "error" ||
      perplexityFetchingStatus.value === "success")
  );
});

async function handleSaveContact(member: Member) {
  try {
    savedMembers.value = await addFamillyMemberInfoToDB(
      isUserLoggedIn?.value.user.id,
      member,
      savedMembers.value
    );
  } catch (error) {
    console.error("Failed to add family member info:", error);
  }
}

async function handleUnsaveContact(member: Member) {
  try {
    savedMembers.value = await removeFamillyMemberInfoFromDB(
      isUserLoggedIn?.value.user.id,
      member,
      savedMembers.value
    );
  } catch (error) {
    console.error("Failed to remove family member info:", error);
  }
}
</script>

<template>
  <SkeletonsSlugSkeleton v-if="loading" />

  <Container v-else>
    <h1 class="subtitles" v-if="profile">
      Informations sur {{ profile[0].firstnames }} {{ profile[0].lastname }}
    </h1>
    <ul class="dead-profile" v-if="profile">
      <li>
        Né(e) à : {{ profile[0].source_birth_com_name }},
        {{ profile[0].current_birth_dep_name }} ({{
          profile[0].source_birth_com_code
        }})
      </li>
      <li>Né(e) le : {{ formattedBirthDate }}</li>
      <li>
        Décédé(e) à: {{ profile[0].current_death_com_name }},
        {{ profile[0].current_death_dep_name }} ({{
          profile[0].current_death_com_code
        }})
      </li>
      <li>
        Décédé(e) le : {{ formattedDeathDate }} ({{
          formattedDeathDateFromNow
        }}), à l'âge de {{ profile[0].age }} ans
      </li>
    </ul>
    <Transition>
      <PrimaryButton
        v-if="displayFamilyButton"
        class="scale-on-hover"
        :class="{ disabled: displaySteps }"
        button-type="dark"
        @click="findFamily()"
      >
        Trouver des proches</PrimaryButton
      ></Transition
    >

    <div class="steps" v-if="displaySteps">
      <Transition>
        <SecondaryButton
          button-type="dark"
          :button-state="perplexityFetchingStatus"
        >
          Recherche des membres de la famille
        </SecondaryButton></Transition
      >

      <Transition>
        <SecondaryButton
          v-if="perplexityFetchingStatus === 'success'"
          button-type="dark"
          :button-state="emailsFetchingStatus"
        >
          Génération des adresses mail
        </SecondaryButton>
      </Transition>

      <Transition>
        <SecondaryButton
          v-if="emailsFetchingStatus === 'success'"
          button-type="dark"
          :button-state="emailsTestingStatus"
        >
          Vérification des adresses mail
        </SecondaryButton></Transition
      >
    </div>

    <h2 v-if="displayFamilyResultsFromDatabase" class="subtitles">
      Contacts
      <IconComponent
        :icon="'loader'"
        v-if="
          displayFamilyResultsFromDatabase && emailsTestingStatus === 'loading'
        "
      />
    </h2>

    <div class="family-members" v-if="displayFamilyResultsFromDatabase">
      <FamilyMember
        v-for="(member, i) in filteredPersonFromDatabase[0]?.family"
        :key="i"
        :member="member"
        :saved-members="savedMembers"
        :userId="isUserLoggedIn?.user.id"
        @save-contact="handleSaveContact"
        @unsave-contact="handleUnsaveContact"
      />
    </div>
  </Container>
</template>
<style lang="scss" scoped>
.steps {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;

  @media (min-width: $big-tablet-screen) {
    gap: 1rem;
    flex-direction: row;
  }
}

.family-members {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.dead-profile {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  list-style: none !important;
}
</style>
