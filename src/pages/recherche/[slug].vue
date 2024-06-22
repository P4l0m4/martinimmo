<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useDeathStore } from "@/stores/deathsStore";
import { stringToSlug } from "@/utils/slugify";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isBetween from "dayjs/plugin/isBetween";
import { fetchPerplexityData, httpGetAsync } from "@/utils/APIData";
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

const perplexityFetchingStatus = ref("");
const emailsFetchingStatus = ref("");
const emailsTestingStatus = ref("");

const APIData = ref([]);

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

const sanitizedAPIData = computed(() => {
  if (profile.value) {
    return removeMatchingNames(
      APIData.value,
      profile.value.firstnames,
      profile.value.lastname
    );
  }
  return;
});

const emailAddresses = ref([]);

function getEmailAdresses() {
  emailsFetchingStatus.value = "loading";
  if (Array.isArray(sanitizedAPIData.value)) {
    const names = sanitizedAPIData.value;
    emailAddresses.value = names.map((name) => {
      const emails = generateEmailAddresses(
        normalizeString(name.first_name),
        normalizeString(name.last_name)
      );

      return {
        person: name,
        emails: emails,
      };
    });
    emailsFetchingStatus.value = "success";
  } else {
    console.error("sanitizedAPIData.value is not an array:");
    emailsFetchingStatus.value = "error";
  }
}

const deliverableEmails = ref([]);

function testEmailsValidity() {
  emailsTestingStatus.value = "loading";
  const delay = 1000; // 1 second delay between requests
  let personIndex = 0;

  function processNextPerson() {
    if (personIndex >= emailAddresses.value.length) {
      emailsTestingStatus.value = "success";
      addPerson(
        profile.value.firstnames,
        profile.value.lastname,
        deliverableEmails.value
      );
      return;
    }

    const personEmails = emailAddresses.value[personIndex];
    const person = personEmails.person;
    const emails = personEmails.emails;
    let emailIndex = 0;

    function processEmail() {
      if (emailIndex >= emails.length) {
        personIndex++;
        setTimeout(processNextPerson, delay); // Move to the next person
        return;
      }

      const email = emails[emailIndex];
      httpGetAsync(email, function (error, response) {
        if (error) {
          console.error("Error:", error);
          emailsFetchingStatus.value = "error";
        } else {
          const data = JSON.parse(response);
          if (data.deliverability === "DELIVERABLE") {
            deliverableEmails.value.push({
              person: person,
              email: email,
              views: 0,
            });

            personIndex++;
            setTimeout(processNextPerson, delay); // Move to the next person
            return;
          }
          // console.log("Response:", response);
        }

        emailIndex++;
        setTimeout(processEmail, delay); // Check the next email for the same person
      });
    }

    processEmail();
  }

  processNextPerson();
}

function findFamily() {
  getDataFromPerplexity()
    .then(() => getEmailAdresses())
    .then(() => testEmailsValidity());
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
  return (
    filteredPersonFromDatabase.value.length >= 0 &&
    deliverableEmails.value.length <= 0 &&
    displayFamilyResultsFromDatabase.value === false
  );
});

const displaySteps = computed(() => {
  return (
    displayFamilyButton.value === true &&
    (perplexityFetchingStatus.value === "loading" ||
      perplexityFetchingStatus.value === "error" ||
      perplexityFetchingStatus.value === "success")
  );
});

// function removeCreditAndUnlock(member: any) {
//   const formattedMember = {
//     first_name: member.person.first_name as String,
//     last_name: member.person.last_name as String,
//     email: member.email as String,
//   };
//   addFamillyMemberInfoToDB(isUserLoggedIn.value.user.id, formattedMember);

//   removeOneCredit(isUserLoggedIn.value.user.id);
// }

async function removeCreditAndUnlock(member: any) {
  const formattedMember = {
    first_name: member.person.first_name as String,
    last_name: member.person.last_name as String,
    email: member.email as String,
  };

  try {
    await addFamillyMemberInfoToDB(
      isUserLoggedIn.value.user.id,
      formattedMember
    );
    removeOneCredit(isUserLoggedIn.value.user.id);
  } catch (error) {
    console.error("Failed to add family member info:", error);
  }
}

onMounted(async () => {
  await deathStore.fetchData();
  records.value = deathStore.records;

  profile.value = records.value.find((p) => {
    const generatedSlug = `${stringToSlug(
      `${p.firstnames} ${p.lastname} ${p.death_date} ${p.current_death_dep_name}`
    )}`;

    return generatedSlug === profileSlug;
  });

  formattedDeathDateFromNow.value = dayjs(profile.value.death_date).fromNow();

  formattedDeathDate.value = dayjs(profile.value.death_date).format(
    "DD MMMM YYYY"
  );
  formattedBirthDate.value = dayjs(profile.value.birth_date).format(
    "DD MMMM YYYY"
  );

  await loadPersons();
  isUserLoggedIn.value = await checkExistingToken();
});
</script>

<template>
  <Container>
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

    <h2
      v-if="deliverableEmails.length > 0 || displayFamilyResultsFromDatabase"
      class="subtitles"
    >
      Contacts
      <IconComponent
        :icon="'loader'"
        v-if="
          deliverableEmails.length < 5 &&
          filteredPersonFromDatabase[0].family.length < 5
        "
      />
    </h2>

    <div class="family-members" v-if="deliverableEmails.length > 0">
      <FamilyMember
        v-for="deliverableEmail in deliverableEmails"
        :key="deliverableEmail"
        :email="deliverableEmail.email"
        :name="`${deliverableEmail.person.first_name} ${deliverableEmail.person.last_name}`"
        :views="deliverableEmail.views"
        :userId="isUserLoggedIn?.user.id"
        @click="removeCreditAndUnlock(deliverableEmail)"
      />
    </div>

    <div class="family-members" v-if="displayFamilyResultsFromDatabase">
      <FamilyMember
        v-for="(member, i) in filteredPersonFromDatabase[0]?.family"
        :key="i"
        :email="member.email"
        :name="`${member.person.first_name} ${member.person.last_name}`"
        :views="member.views"
        :userId="isUserLoggedIn?.user.id"
        @click="removeCreditAndUnlock(member)"
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
