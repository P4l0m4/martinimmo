<script setup lang="ts">
import { fetchFamillyMemberInfoFromDB } from "@/utils/supabase";
import { computed, ref, onMounted } from "vue";

const emailIsClicked = ref(false);

const props = defineProps<{
  email: string;
  name: string;
  views: number;
  userId: string;
}>();

const emailsInDB = ref<any[]>([]);

async function getEmailsFromDB() {
  const data = await fetchFamillyMemberInfoFromDB(props.userId);
  if (!data[0]) return false;
  else {
    emailsInDB.value = data[0].unlocked_info;
  }
}

function checkIfEmailIsUnlocked(email: string) {
  getEmailsFromDB();
  if (!emailsInDB.value.length) return false;
  return emailsInDB.value.some((el) => el.email === email);
}

function copyEmailToClipboard(email: string) {
  navigator.clipboard.writeText(email);
}

const iconColor = computed(() => {
  if (props.views > 2) {
    return "red";
  }
  switch (props.views) {
    case 1:
      return "#FFD700";
    case 2:
      return "#FFA500";
    default:
      return "#232323";
  }
});

async function handleEmailClick() {
  emailIsClicked.value = true;
  const startTime = performance.now();
  const timeout = setTimeout(() => {
    window.location.reload();
  }, 5000); // Set timeout to 5 seconds

  await getEmailsFromDB();

  clearTimeout(timeout);
  const endTime = performance.now();
  const duration = endTime - startTime;

  console.log(`Function execution time: ${duration} milliseconds`);

  if (duration > 5000) {
    window.location.reload();
  }
}

onMounted(async () => {
  await getEmailsFromDB();
});
</script>

<template>
  <Transition>
    <div class="family-member">
      <span>{{ name }}</span>
      <div class="family-member__data">
        <div class="family-member__data__mail">
          <span style="opacity: 0.6"><IconComponent icon="mail" /></span>
          <span
            v-if="!checkIfEmailIsUnlocked(email)"
            class="family-member__data__mail__blur"
            v-tooltip:top="'Utiliser un crédit pour dévoiler l\'adresse mail'"
            @click="handleEmailClick"
            >loremipsum@gmail.com</span
          >
          <IconComponent
            icon="loader"
            v-if="
              emailIsClicked === true && checkIfEmailIsUnlocked(email) === false
            "
          />
          <span v-if="checkIfEmailIsUnlocked(email)" class="unlocked-email"
            >{{ email }}
            <IconComponent
              icon="copy"
              @click="copyEmailToClipboard(email)"
              style="cursor: pointer"
              v-tooltip:top="'Copier l\'adresse mail'"
          /></span>
        </div>
        <span v-if="views > 0" class="family-member__data__views"
          >{{ views }}<IconComponent icon="eye" :color="iconColor"
        /></span>
      </div>
    </div>
  </Transition>
</template>
<style lang="scss" scoped>
.family-member {
  display: flex;
  flex-direction: column;
  background-color: $primary-color;
  box-shadow: $shadow-black;
  padding: 1rem;
  border-radius: $radius;
  gap: 0.5rem;

  &__data {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &__mail {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;

      .unlocked-email {
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
      }

      &__blur {
        filter: blur(4px);
        cursor: pointer;
      }
    }

    &__views {
      display: flex;
      align-items: start;
      gap: 0.5rem;
      margin-left: auto;
    }
  }
}
</style>
