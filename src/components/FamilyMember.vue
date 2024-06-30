<script setup lang="ts">
import {
  fetchFamillyMemberInfoFromDB,
  getCredits,
  addFamillyMemberInfoToDB,
  removeOneCredit,
} from "@/utils/supabase";
import { computed, ref, onMounted } from "vue";
import { useToggle, computedAsync } from "@vueuse/core";
const props = defineProps<{
  email: string;
  firstname: string;
  lastname: string;
  views: number | null;
  userId: string;
}>();

const evaluating = ref(false);

const emailsInDB = computedAsync(async () => {
  const data = await fetchFamillyMemberInfoFromDB(props.userId);
  return data;
}, []);

const [showCreditsPopUp, toggleCreditsPopUp] = useToggle();

const emailIsClicked = ref(false);

const isEmailUnlocked = computed(() => {
  if (emailsInDB.value === null || evaluating.value === true) {
    return;
  }

  return emailsInDB.value[0]?.unlocked_info.some(
    (el: { email: string }) => el.email === props.email
  );
});

function copyEmailToClipboard(email: string) {
  navigator.clipboard.writeText(email);
}

const iconColor = computed(() => {
  if (props.views && props.views > 2) {
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

async function removeCreditAndUnlock() {
  const formattedMember = {
    first_name: props.firstname,
    last_name: props.lastname,
    email: props.email,
  };

  try {
    const response = await addFamillyMemberInfoToDB(
      props.userId,
      formattedMember
    );

    if (response === false) {
      return;
    } else {
      await removeOneCredit(props.userId);
    }
  } catch (error) {
    console.error("Failed to add family member info:", error);
  }
}

async function handleEmailClick() {
  emailIsClicked.value = true;

  const credits = await getCredits(props.userId);

  if (credits.credits > 0) {
    await removeCreditAndUnlock();
  } else {
    toggleCreditsPopUp();
  }

  emailIsClicked.value = false;
}

// onMounted(async () => {
//   await getEmailsFromDB();
// });
</script>
<template>
  <Transition>
    <div class="family-member">
      <span>{{ firstname }} {{ lastname }}</span>
      <div class="family-member__data">
        <div class="family-member__data__mail">
          <span style="opacity: 0.6"><IconComponent icon="mail" /></span>
          <span
            v-if="!isEmailUnlocked"
            class="family-member__data__mail__blur"
            v-tooltip:top="'Utiliser un crédit pour dévoiler l\'adresse mail'"
            @click="handleEmailClick"
            >loremipsum@gmail.com</span
          >
          <IconComponent
            icon="loader"
            v-if="emailIsClicked === true && !isEmailUnlocked"
          />
          <span v-if="isEmailUnlocked" class="unlocked-email">
            {{ email }}
            <IconComponent
              icon="copy"
              @click="copyEmailToClipboard(email)"
              style="cursor: pointer"
              v-tooltip:top="'Copier l\'adresse mail'"
            />
          </span>
        </div>
        <span v-if="views > 0" class="family-member__data__views">
          {{ views }}<IconComponent icon="eye" :color="iconColor" />
        </span>
      </div>
    </div>
  </Transition>
  <ConfirmationPopUp
    v-if="showCreditsPopUp"
    @close-confirmation="toggleCreditsPopUp"
  >
    Plus de crédits disponibles
    <template #button>
      <PrimaryButton button-type="dark" @click="location.reload()">
        Acheter des crédits
      </PrimaryButton>
    </template>
  </ConfirmationPopUp>
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
