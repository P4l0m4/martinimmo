<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useDeathStore } from "@/stores/deathsStore";
import { stringToSlug } from "~/utils/slugify";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isBetween from "dayjs/plugin/isBetween";
import { fetchPerplexityData, httpGetAsync } from "~/utils/APIData";
import { generateEmailAddresses } from "~/utils/emailPatterns";
import { normalizeString } from "~/utils/normalize";
import { removeMatchingNames } from "~/utils/dataSanitization";

dayjs.extend(relativeTime);
dayjs.extend(isBetween);

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
      emailsFetchingStatus.value = "success";
      return {
        person: name,
        emails: emails,
      };
    });
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
});
</script>

<template>
  <Container>
    <div class="steps">
      <PrimaryButton
        button-type="dark"
        :button-state="perplexityFetchingStatus"
        @click="getDataFromPerplexity()"
      >
        Fetch perplexity data
      </PrimaryButton>

      <Transition>
        <PrimaryButton
          v-if="perplexityFetchingStatus === 'success'"
          button-type="dark"
          :button-state="emailsFetchingStatus"
          @click="getEmailAdresses()"
        >
          Generate email addresses
        </PrimaryButton>
      </Transition>

      <Transition>
        <PrimaryButton
          v-if="emailsFetchingStatus === 'success'"
          button-type="dark"
          :button-state="emailsTestingStatus"
          @click="testEmailsValidity()"
        >
          Test email addresses
        </PrimaryButton></Transition
      >
    </div>
  </Container>
  <Container v-if="deliverableEmails.length > 0">
    <h2 class="subtitles">{{ deliverableEmails.length }} proches trouvés</h2>
    <div class="family-members">
      <FamilyMember
        v-for="deliverableEmail in deliverableEmails"
        :key="deliverableEmail"
        :email="deliverableEmail.email"
        :name="`${deliverableEmail.person.first_name} ${deliverableEmail.person.last_name}`"
      /></div
  ></Container>
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
  </Container>
</template>
<style lang="scss" scoped>
.steps {
  display: flex;
  gap: 0.5rem;
}

.family-members {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.dead-profile {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  list-style: none !important;
}
</style>
