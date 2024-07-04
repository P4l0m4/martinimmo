<script setup lang="ts">
import { removeFamillyMemberInfoFromDB } from "@/utils/supabase";
import { ref } from "vue";
const props = defineProps<{
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
}>();

const copyingStatus = ref("");

function copyEmailToClipboard() {
  navigator.clipboard.writeText(props.email);
  copyingStatus.value = "success";
  setTimeout(() => {
    copyingStatus.value = "";
  }, 1000);
}
</script>
<template>
  <Transition>
    <li class="family-member">
      <span>{{ firstName }} {{ lastName }}</span>
      <div class="family-member__data">
        <div class="family-member__data__mail">
          <span style="opacity: 0.6"><IconComponent icon="mail" /></span>

          <span class="unlocked-email"
            >{{ email }}
            <IconComponent
              v-if="copyingStatus === ''"
              icon="copy"
              @click="copyEmailToClipboard"
              style="cursor: pointer; margin-left: auto"
              v-tooltip:top="'Copier l\'adresse mail'" /><IconComponent
              v-if="copyingStatus === 'success'"
              icon="check-circle"
              color="#00a86b"
              style="margin-left: auto"
          /></span>
        </div>
        <IconComponent
          icon="trash"
          style="cursor: pointer"
          v-tooltip:top="'Supprimer'"
          @click="removeFamillyMemberInfoFromDB(userId, email)"
        />
      </div>
    </li>
  </Transition>
</template>
<style lang="scss" scoped>
.family-member {
  display: flex;
  flex-direction: column;
  background-color: $primary-color;
  padding: 1rem;
  border-radius: $radius;
  gap: 0.5rem;
  width: 100%;

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
  }
}
</style>
