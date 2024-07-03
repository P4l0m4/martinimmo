<script setup lang="ts">
import { computed, ref } from "vue";

export type Member = {
  email: string;
  person: {
    first_name: string;
    last_name: string;
  };
};

interface Props {
  member: Member;
  savedMembers: Member[];
  userId: string;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "saveContact", payload: Member): void;
  (e: "unsaveContact", payload: Member): void;
}>();

const savingStatus = computed(() => {
  return isEmailSaved.value;
});

const copyingStatus = ref("");

const isEmailSaved = computed(() => {
  if (props.savedMembers.length === 0) {
    return false;
  }

  return props.savedMembers.some(
    (el: { email: string }) => el.email === props.member.email
  );
});

const savingTooltipText = computed(() => {
  return isEmailSaved.value === true
    ? "Supprimer le contact"
    : "Sauvegarder le contact";
});

function copyEmailToClipboard() {
  navigator.clipboard.writeText(props.member.email);
  copyingStatus.value = "success";
  setTimeout(() => {
    copyingStatus.value = "";
  }, 1000);
}

function handleSaveOrUnsave() {
  if (isEmailSaved.value) {
    emit("unsaveContact", props.member);
  } else {
    emit("saveContact", props.member);
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
        {{ member.person.first_name }} {{ member.person.last_name }}
        <span
          class="family-member__name__icon"
          :class="{ saved: savingStatus === true }"
        >
          <IconComponent
            icon="bookmark"
            @click="handleSaveOrUnsave"
            style="cursor: pointer"
            v-tooltip:top="savingTooltipText"
          />
        </span>
      </div>
      <div class="family-member__data">
        <div class="family-member__data__mail">
          <span style="opacity: 0.6"><IconComponent icon="mail" /></span>

          <span class="unlocked-content">
            {{ member.email }}
            <IconComponent
              v-if="copyingStatus === ''"
              icon="copy"
              @click="copyEmailToClipboard"
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
  <!-- <ConfirmationPopUp
    v-if="showCreditsPopUp"
    @close-confirmation="toggleCreditsPopUp"
  >
    Plus de crédits disponibles
    <template #button>
      <PrimaryButton button-type="dark" @click="location.reload()">
        Acheter des crédits
      </PrimaryButton>
    </template>
  </ConfirmationPopUp> -->
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
