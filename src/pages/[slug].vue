<script lang="ts" setup>
import { stringToSlug } from "@/utils/slugify";
import { ref, onMounted, computed } from "vue";
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
  <pre v-if="profile">{{ profile[0] }}</pre>
  <pre v-if="family">{{ family }}</pre>
</template>
