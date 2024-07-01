<script setup lang="ts">
import {
  fetchFamillyMemberInfoFromDB,
  getCredits,
  addFamillyMemberInfoToDB,
  removeOneCredit,
  removeFamillyMemberInfoFromDB,
} from "@/utils/supabase";
import { computed, ref, onMounted } from "vue";
import { useToggle, computedAsync } from "@vueuse/core";
const props = defineProps<{
  email: string;
  firstname: string;
  lastname: string;
  userId: string;
}>();

const evaluating = ref(false);

const savingStatus = computed(() => {
  return isEmailSaved.value;
});

const copyingStatus = ref("");

const emailsInDB = computedAsync(async () => {
  const data = await fetchFamillyMemberInfoFromDB(props.userId);
  return data;
}, []);

const [showCreditsPopUp, toggleCreditsPopUp] = useToggle();

const emailIsClicked = ref(false);

const isEmailSaved = computed(() => {
  if (emailsInDB.value === null || evaluating.value === true) {
    return;
  }

  return emailsInDB.value[0]?.saved_contacts.some(
    (el: { email: string }) => el.email === props.email
  );
});

const savingTooltipText = computed(() => {
  return isEmailSaved.value === true
    ? "Supprimer le contact"
    : "Sauvegarder le contact";
});

function copyEmailToClipboard(email: string) {
  navigator.clipboard.writeText(email);
  copyingStatus.value = "success";
  setTimeout(() => {
    copyingStatus.value = "";
  }, 1000);
}

async function SaveContact() {
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
    }
    setTimeout(() => {
      location.reload();
    }, 1000);
  } catch (error) {
    console.error("Failed to add family member info:", error);
  }
}

function handleSaveOrUnsave() {
  if (isEmailSaved.value) {
    removeFamillyMemberInfoFromDB(props.userId, props.email);
  } else {
    SaveContact();
  }
}

// async function removeCreditAndUnlock() {
//   const formattedMember = {
//     first_name: props.firstname,
//     last_name: props.lastname,
//     email: props.email,
//   };

//   try {
//     const response = await addFamillyMemberInfoToDB(
//       props.userId,
//       formattedMember
//     );

//     if (response === false) {
//       return;
//     } else {
//       await removeOneCredit(props.userId);
//     }
//   } catch (error) {
//     console.error("Failed to add family member info:", error);
//   }
// }

// async function handleEmailClick() {
//   emailIsClicked.value = true;

//   const credits = await getCredits(props.userId);

//   if (credits.credits > 0) {
//     await removeCreditAndUnlock();
//   } else {
//     toggleCreditsPopUp();
//   }

//   emailIsClicked.value = false;
// }

// onMounted(async () => {
//   await getEmailsFromDB();
// });
</script>
<template>
  <Transition>
    <div class="family-member">
      <div class="family-member__name">
        {{ firstname }} {{ lastname }}
        <span
          class="family-member__name__icon"
          :class="{ saved: savingStatus === true }"
        >
          <IconComponent
            icon="bookmark"
            @click="handleSaveOrUnsave()"
            style="cursor: pointer"
            v-tooltip:top="savingTooltipText"
          />
        </span>
      </div>
      <div class="family-member__data">
        <div class="family-member__data__mail">
          <span style="opacity: 0.6"><IconComponent icon="mail" /></span>
          <!-- <span
            v-if="!isEmailSaved"
            class="family-member__data__mail__blur"
            v-tooltip:top="'Utiliser un crédit pour dévoiler l\'adresse mail'"
            @click="handleEmailClick"
            >loremipsum@gmail.com</span
          > -->

          <span class="unlocked-content">
            {{ email }}
            <IconComponent
              v-if="copyingStatus === ''"
              icon="copy"
              @click="copyEmailToClipboard(email)"
              style="cursor: pointer; margin-left: auto"
              v-tooltip:top="'Copier l\'adresse mail'"
            /><IconComponent
              v-if="copyingStatus === 'success'"
              icon="check-circle"
              color="#00a86b"
              style="margin-left: auto"
            />
          </span>
        </div>
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

  &__name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;

    &__icon {
      display: flex;
      align-items: center;
      margin-left: auto;
    }
  }

  &__data {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &__mail {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;

      .unlocked-content {
        display: flex;
        width: 100%;
        gap: 0.5rem;
        align-items: center;
      }

      // &__blur {
      //   filter: blur(4px);
      //   cursor: pointer;
      // }
    }
  }
}

.saved {
  background-color: $success-color-faded;
}
</style>
