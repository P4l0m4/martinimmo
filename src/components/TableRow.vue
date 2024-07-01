<script setup lang="ts">
import { removeFamillyMemberInfoFromDB } from "@/utils/supabase";
defineProps<{
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
}>();

function copyEmailToClipboard(email: string) {
  navigator.clipboard.writeText(email);
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
              icon="copy"
              @click="copyEmailToClipboard(email)"
              style="cursor: pointer"
              v-tooltip:top="'Copier l\'adresse mail'"
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
