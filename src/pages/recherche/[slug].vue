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
import {
  addPerson,
  fetchPersons,
  removeOneCredit,
  checkExistingToken,
  addFamillyMemberInfoToDB,
} from "@/utils/supabase";
import { sleep } from "@/utils/sleep";

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

onMounted(async () => {
  loading.value = true;
  isUserLoggedIn.value = await checkExistingToken();
  if (isUserLoggedIn.value === null) {
    await navigateTo({ path: "/" });
  }

  await deathStore.fetchData();
  records.value = deathStore.records;
  await initProfileData();
  loading.value = false;
});

async function initProfileData() {
  profile.value = records.value.find((p: any) => {
    const generatedSlug = `${stringToSlug(
      `${p.firstnames} ${p.lastname} ${p.death_date} ${p.current_death_dep_name}`
    )}`;
    formattedDeathDateFromNow.value = dayjs(p.death_date).fromNow();
    formattedDeathDate.value = dayjs(p.death_date).format("DD MMMM YYYY");
    formattedBirthDate.value = dayjs(p.birth_date).format("DD MMMM YYYY");
    return generatedSlug === profileSlug;
  });

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
      `first name is ${profile.value.firstnames}, last name is ${profile.value.lastname}, death date is ${profile.value.death_date}, death departement/location is ${profile.value.current_death_dep_name}, death city is ${profile.value.current_death_com_name}, birth date is ${profile.value.birth_date}, birth departement/location is ${profile.value.current_birth_dep_name}, this person died at the age of ${profile.value.age} years old and was a french citizen.`
    );

    const jsonString = data.choices[0].message.content.match(
      /```json\n([\s\S]*?)\n```/
    )[1];
    perplexityFetchingStatus.value = "success";
    APIData.value = JSON.parse(jsonString);
  } catch (error) {
    console.error("Error fetching data:", error);
    perplexityFetchingStatus.value = "error";
  }
}

const sanitizedAPIData = computed<[]>(() => {
  if (!profile.value) return [];
  return removeMatchingNames(
    JSON.parse(JSON.stringify(APIData.value)),
    profile.value.firstnames,
    profile.value.lastname
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
    console.error("sanitizedAPIData.value is not an array:");
    emailsFetchingStatus.value = "error";
  }
}

async function testEmailsValidity() {
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
            views: 0,
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
    profile.value.firstnames,
    profile.value.lastname,
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
      person.firstname === profile.value.firstnames &&
      person.lastname === profile.value.lastname
    );
  });
});

const displayFamilyResultsFromDatabase = computed(() => {
  return filteredPersonFromDatabase.value.length > 0;
});

const displayFamilyButton = computed(() => {
  return filteredPersonFromDatabase.value.length === 0;
});

const displaySteps = computed(() => {
  return (
    displayFamilyButton.value === true &&
    (perplexityFetchingStatus.value === "loading" ||
      perplexityFetchingStatus.value === "error" ||
      perplexityFetchingStatus.value === "success")
  );
});
</script>

<template>
  <div v-if="loading">Loading...</div>
  <Container v-else>
    <h1 class="subtitles">
      Informations sur {{ profile?.firstnames }} {{ profile?.lastname }}
    </h1>
    <ul class="dead-profile">
      <li>
        Né(e) à : {{ profile?.source_birth_com_name }},
        {{ profile?.current_birth_dep_name }} ({{
          profile?.source_birth_com_code
        }})
      </li>
      <li>Né(e) le : {{ formattedBirthDate }}</li>
      <li>
        Décédé(e) à: {{ profile?.current_death_com_name }},
        {{ profile?.current_death_dep_name }} ({{
          profile?.current_death_com_code
        }})
      </li>
      <li>
        Décédé(e) le : {{ formattedDeathDate }} ({{
          formattedDeathDateFromNow
        }}), à l'âge de {{ profile?.age }} ans
      </li>
    </ul>
    <Transition>
      <PrimaryButton
        v-if="displayFamilyButton"
        class="scale-on-hover"
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
        v-if="filteredPersonFromDatabase[0].family.length < 5"
      />
    </h2>

    <div class="family-members" v-if="displayFamilyResultsFromDatabase">
      <FamilyMember
        v-for="(member, i) in filteredPersonFromDatabase[0]?.family"
        :key="i"
        :email="member.email"
        :firstname="member.person.first_name"
        :lastname="member.person.last_name"
        :views="member.views"
        :userId="isUserLoggedIn?.user.id"
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
