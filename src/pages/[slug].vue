<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useDeathStore } from "@/stores/deathsStore";
import { stringToSlug } from "~/utils/slugify";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isBetween from "dayjs/plugin/isBetween";
import { fetchPerplexityData } from "~/utils/APIData";
import { generateEmailAddresses } from "~/utils/emailPatterns";
import { normalizeString } from "~/utils/normalize";

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

const APIData = ref([]);

async function getDataFromPerplexity() {
  try {
    const data = await fetchPerplexityData(
      `first name is ${profile.value.firstnames}, last name is ${profile.value.lastname}, death date is ${profile.value.death_date}, death departement/location is ${profile.value.current_death_dep_name}, death city is ${profile.value.current_death_com_name}, birth date is ${profile.value.birth_date}, birth departement/location is ${profile.value.current_birth_dep_name}, this person died at the age of ${profile.value.age} years old and was a french citizen.`
    );

    const jsonString = data.choices[0].message.content.match(
      /```json\n([\s\S]*?)\n```/
    )[1];
    APIData.value = JSON.parse(jsonString);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

const emailAddresses = ref([]);

function getEmailAdresses() {
  console.log("APIData value at email generation:", APIData.value);

  if (Array.isArray(APIData.value)) {
    const names = APIData.value;

    names.forEach((name) => {
      const emails = generateEmailAddresses(
        normalizeString(name.first_name),
        normalizeString(name.last_name)
      );
      emailAddresses.value.push(...emails);
      console.log("Generated emails for", name, ":", emails);
    });
  } else {
    console.error("APIData.value is not an array:", APIData.value);
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
});
</script>

<template>
  <Container>
    <h1>Profil de {{ profile?.firstnames }} {{ profile?.lastname }}</h1>

    <span
      >Né(e) à : {{ profile?.source_birth_com_name }},
      {{ profile?.current_birth_dep_name }} ({{
        profile?.source_birth_com_code
      }})</span
    >
    <span>Né(e) le : {{ formattedBirthDate }}</span>
    <span
      >Décédé(e) à: {{ profile?.current_death_com_name }},
      {{ profile?.current_death_dep_name }} ({{
        profile?.current_death_com_code
      }})</span
    >
    <span
      >Décédé(e) le : {{ formattedDeathDate }} ({{
        formattedDeathDateFromNow
      }}), à l'âge de {{ profile?.age }} ans</span
    >
  </Container>
  <Container>
    <button
      class="button-primary"
      style="width: fit-content"
      @click="getDataFromPerplexity()"
    >
      Fetch perplexity data
    </button>

    <pre>{{ APIData }}</pre>

    <button
      class="button-primary"
      style="width: fit-content"
      @click="getEmailAdresses()"
    >
      Generate email addresses
    </button>

    <pre>{{ emailAddresses }}</pre>
  </Container>
</template>
