<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  checkExistingToken,
  signOut,
  deleteAllSavedContacts,
  fetchFamillyMemberInfoFromDB,
} from "@/utils/supabase";
import { useAccountStore } from "@/stores/accountStore";
import { useToggle } from "@vueuse/core";

const [showConfirmation, toggleConfirmation] = useToggle();

const accountStore = useAccountStore();

const isUserLoggedIn = ref();

const emailsInDB = ref<any[]>([]);

const loading = ref(false);

async function getEmailsFromDB() {
  if (!isUserLoggedIn.value) return;
  const data = await fetchFamillyMemberInfoFromDB(isUserLoggedIn.value.user.id);
  if (!data[0]) return false;
  else {
    emailsInDB.value = data[0].saved_contacts;
  }
}

function generateCSV() {
  const csv = emailsInDB.value.map((row) => {
    return `${row.first_name},${row.last_name},${row.email}`;
  });
  const csvArray = ["First Name,Last Name,Email"].concat(csv).join("\n");
  const a = document.createElement("a");
  a.href = "data:attachment/csv," + encodeURI(csvArray);
  a.target = "_blank";
  a.download = "contacts.csv";
  document.body.appendChild(a);
  a.click();
}

onMounted(async () => {
  loading.value = true;
  isUserLoggedIn.value = await checkExistingToken();
  loading.value = false;
  if (isUserLoggedIn.value) {
    accountStore.creditsFromDB(isUserLoggedIn.value.user.id);
  }
  getEmailsFromDB();
});
</script>
<template>
  <SkeletonsMyAccountSkeleton v-if="loading" />
  <template v-if="isUserLoggedIn?.user.aud">
    <Container>
      <h1 class="subtitles">Mon compte</h1>
      <div class="lists">
        <ul class="account-info">
          <div class="header">
            <span class="header__text"
              ><span style="opacity: 0.6"><IconComponent icon="info" /></span
              >Vos informations</span
            >
          </div>
          <li class="account-info__element">
            <span class="account-info__element__icon"
              ><IconComponent icon="credit-card" /></span
            >{{ accountStore.$state.credits }}
            Crédits disponibles
          </li>

          <li class="account-info__element">
            <span class="account-info__element__icon"
              ><IconComponent icon="star"
            /></span>
            Compte
            {{ isUserLoggedIn?.user.user_metadata.accountType }}
          </li>
          <li class="account-info__element">
            <span class="account-info__element__icon"
              ><IconComponent icon="mail"
            /></span>
            {{ isUserLoggedIn?.user.email }}
          </li>
          <PrimaryButton
            button-type="dark"
            @click="signOut"
            class="logout-button"
            >Déconnexion</PrimaryButton
          >
        </ul>
        <ul class="unlocked-persons">
          <div
            v-if="emailsInDB.length"
            class="header"
            style="justify-content: space-between"
          >
            <span class="header__text"
              ><span style="opacity: 0.6"
                ><IconComponent icon="bookmark" /></span
              >Vos contacts sauvegardés</span
            ><SecondaryButton
              button-type="dark"
              @click="generateCSV()"
              :button-state="loading"
              ><IconComponent icon="download" /> Exporter au format
              CSV</SecondaryButton
            >
            <button class="button--tertiary-dark" @click="toggleConfirmation">
              <IconComponent icon="trash" /> Tout supprimer
            </button>

            <ConfirmationPopUp
              v-if="showConfirmation"
              @close-confirmation="toggleConfirmation"
              >Êtes-vous sûr(e) de vouloir supprimer touts les contacts
              sauvegardés ?<template #button
                ><PrimaryButton
                  button-type="dark"
                  @click="deleteAllSavedContacts(isUserLoggedIn?.user.id)"
                  >Oui, supprimer</PrimaryButton
                ></template
              >
            </ConfirmationPopUp>
          </div>
          <TableRow
            v-for="email in emailsInDB"
            :key="email.email"
            :first-name="email.first_name"
            :last-name="email.last_name"
            :email="email.email"
            :userId="isUserLoggedIn?.user.id"
          />

          <li v-if="!emailsInDB.length" class="empty">
            Lorsque vous débloquerez des contacts, ils apparaîtront ici
          </li>
        </ul>
      </div>
    </Container>
  </template>
  <template v-if="!isUserLoggedIn?.user.aud">
    <MustBeAuthenticated />
  </template>
</template>
<style lang="scss" scoped>
.lists {
  display: flex;
  gap: 4rem;
  flex-direction: column;

  @media (min-width: $laptop-screen) {
    flex-direction: row;
    justify-content: space-between;
  }

  .account-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    &__element {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1rem;

      &__icon {
        opacity: 0.6;
      }
    }

    .logout-button {
      margin-top: 1rem;
    }
  }

  .unlocked-persons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    list-style: none;

    .empty {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      text-align: center;
    }
  }

  .account-info,
  .unlocked-persons {
    .header {
      display: flex;
      gap: 1rem;
      background-color: $primary-color;
      padding: 1rem;
      margin-bottom: 2rem;
      border-radius: $radius;

      &__text {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
  }
}
</style>
