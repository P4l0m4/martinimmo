<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(relativeTime);
dayjs.extend(isBetween);

const route = useRoute();

const profileSlug = route.params.slug;
const profile = ref();
const family = ref();
const formattedDeathDateFromNow = ref();
const formattedDeathDate = ref();
const formattedBirthDate = ref();
const loading = ref(false);
const isUserLoggedIn = ref();

onMounted(async () => {
  loading.value = true;
  isUserLoggedIn.value = await checkExistingToken();
  if (isUserLoggedIn.value === null) {
    await navigateTo({ path: "/" });
  }

  await initProfileData();
  family.value = await getFamillyByDeceasedId(profile.value[0].id);
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
}
</script>
<template>
  <Container
    ><div class="disclaimer">
      <span class="subtitles">Que représentent ces données ?</span>
      <span>
        Les emails présentés ici sont des exemples représentant la structure la
        plus probable pour une combinaison nom-prénom donnée. Elles sont
        destinées à un usage purement statistique et analytique. pour vous
        guider. Consultez notre
        <NuxtLink to="/faq" class="button--tertiary-light">FAQ</NuxtLink>
        et nos
        <NuxtLink
          to="https://docs.google.com/document/d/e/2PACX-1vTOGTdv866qLzIX4H8alMu0WlN-CeYjKNgtsEIJiimH1npT3ypGF3KCcu3eN0h9zmYpVWgK8wzcQqyi/pub"
          target="_blank"
          class="button--tertiary-light"
          >CGU</NuxtLink
        >
        pour plus d'informations sur la provenance, la pertinence et
        l'utilisation de ces données.
      </span>
    </div></Container
  >
  <Container v-if="profile">
    <div class="profile">
      <img
        class="face"
        src="@/assets/images/man.svg"
        alt="man profile"
        v-if="profile[0].sex === 'M'"
      />
      <img
        class="face"
        src="@/assets/images/woman.svg"
        alt="woman profile"
        v-else
      />
      <div class="profile__text">
        <h1 class="subtitles">
          {{ profile[0].firstnames }} {{ profile[0].lastname }}
        </h1>
        <h2 class="paragraphs dates">
          {{ formattedBirthDate }} | {{ formattedDeathDate }}
        </h2>
        <ul class="list">
          <li class="paragraphs">
            Né(e) à {{ profile[0].source_birth_com_name }}, en
            {{ profile[0].current_birth_dep_name }} ({{
              profile[0].current_birth_dep_code
            }}).
          </li>
          <li class="paragraphs">
            Décédé(e) à {{ profile[0].current_death_com_name }}, en
            {{ profile[0].current_death_dep_name }} ({{
              profile[0].current_death_dep_code
            }}) à l'âge de {{ profile[0].age }} ans.
          </li>
        </ul>
      </div>

      <div class="family">
        <div v-for="member in family" :key="member.id" class="family__member">
          <img
            class="family__member__face"
            src="@/assets/images/man.svg"
            alt="man profile"
            v-if="member.sex === 'M'"
          />
          <img
            class="family__member__face"
            src="@/assets/images/woman.svg"
            alt="woman profile"
            v-else
          />
          <div class="family__member__info">
            <span>{{ member.firstnames }} {{ member.lastname[0] }}.</span>
            <span>{{ member.email }}</span>
          </div>
        </div>
      </div>
    </div>
  </Container>
</template>
<style scoped lang="scss">
.profile {
  display: flex;
  gap: 1rem;
  flex-direction: column;

  &__text {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;

    @media (min-width: $big-tablet-screen) {
      max-width: 260px;
    }
  }

  @media (min-width: $laptop-screen) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.face {
  width: 100px;
  -moz-transform: scale(-1, 1);
  -webkit-transform: scale(-1, 1);
  -o-transform: scale(-1, 1);
  -ms-transform: scale(-1, 1);
  transform: scale(-1, 1);

  @media (min-width: $big-tablet-screen) {
    width: 60%;
    max-width: 400px;
  }
}

.dates {
  white-space: nowrap;
}

.list {
  list-style: upper-roman;
  list-style-position: inside;

  li {
    margin-bottom: 0.5rem;
  }
}

.family {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  @media (min-width: $laptop-screen) {
    padding-left: 10%;
  }

  &__member {
    display: flex;
    gap: 0.5rem;
    align-items: center;

    &__face {
      background-color: $primary-color;
      padding: 0.5rem;
      border-radius: 50%;
      width: 40px;
      -moz-transform: scale(-1, 1);
      -webkit-transform: scale(-1, 1);
      -o-transform: scale(-1, 1);
      -ms-transform: scale(-1, 1);
      transform: scale(-1, 1);
    }

    &__info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      white-space: nowrap;
    }
  }
}
</style>
