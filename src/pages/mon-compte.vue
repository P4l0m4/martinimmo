<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";

import {
  checkExistingToken,
  signOut,
  deleteSavedContactByID,
  fetchDeadPersonInfoFromDB,
  addFamillyToDB,
  getFamillyByDeceasedId,
} from "@/utils/supabase";
import { copyToClipboard, share } from "~/utils/otherFunctions";
import { fetchPerplexityData, validateEmail } from "@/utils/APIData";
import { useAccountStore } from "@/stores/accountStore";
import { set, useToggle } from "@vueuse/core";
import { generateEmailAddresses } from "@/utils/emailPatterns";
import { normalizeString } from "@/utils/normalize";
import { removeMatchingNames } from "@/utils/dataSanitization";
import { sleep } from "@/utils/sleep";
import { deleteUserAccount } from "@/utils/supabase";
import type { FamilyMember } from "@/components/FamilyMember.vue";

interface DeadPerson {
  id: string;
  firstnames: string;
  lastname: string;
  current_death_com_name: string;
  current_death_dep_code: string;
  hasFamilyInDB: boolean;
  status: "idle" | "loading" | "success" | "error";
}
const route = useRoute();

const [showConfirmation, toggleConfirmation] = useToggle();
const [showOverloadPopUp, toggleOverloadPopUp] = useToggle();
const [showRGPDPopUp, toggleRGPDPopUp] = useToggle();
const [showDeletionPopUp, toggleDeletionPopUp] = useToggle();

const accountStore = useAccountStore();

const isUserLoggedIn = ref();
interface Count {
  id: string;
  count: number;
}
const persons = ref<DeadPerson[]>([]);
const relativesCountByPerson = ref<Count[]>([]);

const loading = ref(false);
const dataExportLoading = ref<"success" | "error" | "loading">();
const APIData = ref([]);

const sponsorMessage = ref<string>("");

const allFamilyMembers = ref<FamilyMember[]>([]);

const isBoxChecked = ref(false);
const boxArray = ref<boolean[]>([]);

const isMobile = computed(() => window.innerWidth < 768);

async function getDataFromPerplexity(profile: DeadPerson) {
  console.log("Fetching data for person:", profile.firstnames);
  try {
    const data = await fetchPerplexityData(
      `first name is ${profile.firstnames}, last name is ${profile.lastname}, death date is ${profile.death_date}, death departement/location is ${profile.current_death_dep_name}, death city is ${profile.current_death_com_name}, birth date is ${profile.birth_date}, birth departement/location is ${profile.current_birth_dep_name}, this person died at the age of ${profile.age} years old and was a french citizen.`
    );

    const match = data.choices[0].message.content.match(
      /```json\n([\s\S]*?)\n```/
    );

    if (!match) {
      throw new Error("JSON content not found in response");
    }

    const jsonString = match[1].trim();
    const correctedJsonString = `[${jsonString}]`;

    APIData.value = JSON.parse(correctedJsonString);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function sanitizeDataForPerson(person: DeadPerson) {
  if (!APIData.value || APIData.value.length === 0) return [];

  const sanitized = removeMatchingNames(
    [...APIData.value],
    person.firstnames,
    person.lastname
  );

  sanitized.forEach((member) => {
    member.id_from_deceased = person.id;
  });

  return sanitized;
}

async function validateEmailsAndAddToDB(
  sanitizedFamilyMembers: FamilyMember[],
  deceasedId: string
) {
  let validFamilyMembers: FamilyMember[] = [];

  for (const member of sanitizedFamilyMembers) {
    const emails = generateEmailAddresses(
      normalizeString(member.first_name),
      normalizeString(member.last_name)
    );

    if (!emails || emails.length === 0) {
      continue;
    }

    for (const email of emails) {
      if (!email) {
        continue;
      }

      try {
        const response = await validateEmail(email);
        if (response.deliverability === "DELIVERABLE") {
          const doesEmailExistInDB = await checkIfFamilyMemberExists(email);

          if (doesEmailExistInDB.length > 0) {
            continue;
          }

          validFamilyMembers.push({ ...member, email: email });
          await addFamillyToDB({ ...member, email: email });
          break;
        }
        await sleep(1100);
      } catch (error) {
        console.error("Error validating email:", error);
      }
    }
  }

  return validFamilyMembers.length;
}

async function processPerson(deadPerson: DeadPerson) {
  deadPerson.status = "loading";

  try {
    await getDataFromPerplexity(deadPerson);

    const sanitizedFamilyMembers = sanitizeDataForPerson(deadPerson);

    if (sanitizedFamilyMembers.length === 0) {
      deadPerson.status = "error";
      return;
    }

    const validFamilyMembersCount = await validateEmailsAndAddToDB(
      sanitizedFamilyMembers,
      deadPerson.id
    );

    deadPerson.status = validFamilyMembersCount > 0 ? "success" : "error";
  } catch (error) {
    console.error("Error processing person:", error);
    deadPerson.status = "error";
  }
}

async function findFamily() {
  for (const deadPerson of persons.value) {
    if (!deadPerson.hasFamilyInDB) {
      await processPerson(deadPerson);
    }
  }
}

async function getPersonsFromDB() {
  if (!isUserLoggedIn.value) return;
  const data = await fetchDeadPersonInfoFromDB(isUserLoggedIn.value.user.id);
  if (data.length === 0) {
    return;
  }

  const allPersons = [];
  for (const person of data) {
    const existingFamilyMembers = await getFamillyByDeceasedId(person.id);
    const hasFamilyInDB = existingFamilyMembers.length > 0;

    if (hasFamilyInDB) {
      relativesCountByPerson.value.push({
        id: person.id,
        count: existingFamilyMembers.length,
      });
    }

    allPersons.push({
      ...person,
      hasFamilyInDB,
      status: "idle",
    });
  }

  persons.value = allPersons;
}

function getRelativesCount(deceasedId: string): number {
  const personCount = relativesCountByPerson.value.find(
    (entry) => entry.id === deceasedId
  );
  return personCount ? personCount.count : 0;
}

const averageRelativesPerPerson = computed(() => {
  if (relativesCountByPerson.value.length === 0) return 0;

  const totalRelatives = relativesCountByPerson.value.reduce(
    (acc, entry) => acc + entry.count,
    0
  );

  return totalRelatives / relativesCountByPerson.value.length;
});

async function generateCSV() {
  dataExportLoading.value = "loading";
  let csvContent =
    "Firstname;Lastname;Death Region;Community;Death Department Code;Family Member Firstname;Family Member Email;Family Member Sex\n";

  for (const person of persons.value) {
    // Safely retrieve family members by awaiting the async function
    const familyMembers = await getFamillyByDeceasedId(person.id);

    // If no family members, include the person details
    if (!familyMembers || familyMembers.length === 0) {
      csvContent += `${person.firstnames ?? ""};${person.lastname ?? ""};${person.current_death_reg_name ?? ""};${person.current_death_com_name ?? ""};${person.current_death_dep_code ?? ""},,,,\n`;
    } else {
      for (const familyMember of familyMembers) {
        csvContent += `${person.firstnames ?? ""};${person.lastname ?? ""};${person.current_death_reg_name ?? ""};${person.current_death_com_name ?? ""};${person.current_death_dep_code ?? ""};${familyMember.firstnames ?? ""};${familyMember.email ?? ""};${familyMember.sex ?? ""}\n`;
      }
    }
  }

  // Create and download the CSV file
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "profiles_with_relatives.csv";
  a.click();

  dataExportLoading.value = "success";

  setTimeout(() => {
    toggleRGPDPopUp(false);
  }, 2000);
}

async function getAllFamilyMembers() {
  for (const person of persons.value) {
    const familyMembers = await getFamillyByDeceasedId(person.id);
    allFamilyMembers.value.push(...familyMembers);
  }
}

function selectTenBoxes() {
  isBoxChecked.value = !isBoxChecked.value;
  boxArray.value = persons.value.map(() => isBoxChecked.value);
}

function updateBox(index: number, newValue: boolean) {
  boxArray.value.splice(index, 1, newValue);

  isBoxChecked.value = boxArray.value.every((box) => box);
}
const deceasedIDOfPersonsToBeDeleted = computed(() => {
  return boxArray.value
    .map((box, index) => (box ? persons.value[index].id : null))
    .filter((id) => id);
});

function deleteSelectedContactsWithFamilyMembers() {
  const userId = isUserLoggedIn.value.user.id;

  deceasedIDOfPersonsToBeDeleted.value.forEach(async (deceasedID: any) => {
    await deleteSavedContactByID(userId, deceasedID);
  });
}

const isLoading = computed(() => {
  return persons.value.some((person) => person.status === "loading");
});

const deletionStatus = ref<"default" | "loading" | "success" | "error">(
  "default"
);
async function handleUserDeletion() {
  deletionStatus.value = "loading";
  // const response = await deleteUserAccount(isUserLoggedIn.value.user.id);
  const response = await deleteUserAccount("hello");
  if (response?.success) {
    deletionStatus.value = "success";
    setTimeout(() => {
      signOut();
    }, 1000);
  } else {
    deletionStatus.value = "error";
    console.error("Error deleting user account");
  }
}

const sharingStatus = ref<"default" | "loading" | "success" | "error">(
  "default"
);

function handleSharing(message: string) {
  sharingStatus.value = "loading";
  if (isMobile.value) {
    return share(message);
  }
  copyToClipboard(message);
  sharingStatus.value = "success";

  setTimeout(() => {
    sharingStatus.value = "default";
  }, 1000);
}

//watch for changes in showDeletionPopUp with a watcher
watch(showDeletionPopUp, (newValue) => {
  if (newValue) {
    console.log("Deletion popup: ", newValue);
  }
});

window.addEventListener("beforeunload", function (e) {
  if (isLoading.value === true) {
    e.preventDefault();
  }
});

onMounted(async () => {
  loading.value = true;
  localStorage.setItem("notification", "false");
  isUserLoggedIn.value = await checkExistingToken();

  if (isUserLoggedIn.value) {
    accountStore.creditsFromDB(isUserLoggedIn.value.user.id);
  }
  await getPersonsFromDB();
  loading.value = false;

  if (allFamilyMembers.value.length > 50) {
    toggleOverloadPopUp();
  }

  await getAllFamilyMembers();

  boxArray.value = persons.value.map(() => false);
  sponsorMessage.value = `Rendez-vous sur https://martinimmo.netlify.app, rentrez en contact avec des millions de particuliers cherchant à vendre, nettoyer ou débarasser un bien immobillier. 
  10 crédits offers et 10 crédits suplémentaires en renseignant le code de votre parrain à l'inscription:
  ${isUserLoggedIn.value?.user.id}
  `;
});

useHead({
  title: "MartinImmo | Mon compte",
  meta: [
    {
      name: "description",
      content:
        "Gérez vos profils débloqués et générez des profils qualifiés, testez vos emails avant de les envoyer.",
    },
    { property: "og:title", content: "MartinImmo | Mon compte" },
    {
      property: "og:description",
      content: `Rentrez en contact avec des millions de particuliers cherchant à vendre, nettoyer ou débarasser un bien immobillier. 
  10 crédits offers et 10 crédits suplémentaires en renseignant le code de votre parrain à l'inscription.`,
    },
    {
      property: "og:url",
      content: `https://martinimmo.netlify.app${route.path}`,
    },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "fr_FR" },
  ],
});
</script>

<template>
  <SkeletonsMyAccountSkeleton v-if="loading" />
  <template v-if="isUserLoggedIn?.user.aud">
    <Container>
      <div class="lists">
        <div class="unlocked-persons">
          <div
            v-if="persons.length > 0"
            class="header"
            style="justify-content: space-between"
          >
            <span class="header__text">
              <span style="opacity: 0.6"><IconComponent icon="unlock" /></span>
              Profils débloqués
            </span>
            <PrimaryButton
              button-type="dark"
              v-if="!isLoading"
              @click="findFamily"
              >Trouver des proches</PrimaryButton
            ><span
              style="
                display: flex;
                gap: 0.5rem;
                align-items: center;
                text-wrap: balance;
              "
              v-else
              >Recherche en cours, gardez cette page ouverte<IconComponent
                icon="loader"
            /></span>

            <SecondaryButton button-type="dark" @click="toggleRGPDPopUp"
              ><IconComponent icon="download" />Exporter les données
            </SecondaryButton>

            <ConfirmationPopUp
              v-if="showRGPDPopUp"
              @close-confirmation="toggleRGPDPopUp"
              >Attention, l'usage des données générées est strictement réservé
              aux finalités permises par la
              <NuxtLink
                to="https://docs.google.com/document/d/e/2PACX-1vRl0b5T5OmciZCyENe13NQgpoZH2g7YlzJUzgwiQwjbwLoOAvtbgrQDE-xVRqncwj8pHzeM8XxDEvMF/pub"
                target="_blank"
                >loi</NuxtLink
              >
              et précisées dans nos
              <NuxtLink
                to="https://docs.google.com/document/d/e/2PACX-1vTOGTdv866qLzIX4H8alMu0WlN-CeYjKNgtsEIJiimH1npT3ypGF3KCcu3eN0h9zmYpVWgK8wzcQqyi/pub"
                target="_blank"
                >CGU</NuxtLink
              >.<template #button>
                <PrimaryButton
                  button-type="dark"
                  @click="generateCSV()"
                  :button-state="dataExportLoading"
                >
                  <IconComponent icon="download" />J'ai compris, exporter
                </PrimaryButton></template
              >
            </ConfirmationPopUp>

            <ConfirmationPopUp
              v-if="showConfirmation"
              @close-confirmation="toggleConfirmation"
            >
              Êtes-vous sûr(e) de vouloir supprimer
              {{ boxArray.filter((box) => box).length }} contact(s)
              sauvegardé(s) et les proches associés ?
              <template #button>
                <PrimaryButton
                  button-type="dark"
                  @click="deleteSelectedContactsWithFamilyMembers"
                >
                  Oui, supprimer
                </PrimaryButton>
              </template>
            </ConfirmationPopUp>
            <ConfirmationPopUp
              v-if="showOverloadPopUp"
              @close-confirmation="toggleOverloadPopUp"
            >
              Vous avez {{ allFamilyMembers.length }} profils débloqué(s),
              téléchargez puis les supprimez les afin d'améliorer le chargement
              de la page.
              <template #button>
                <PrimaryButton button-type="dark" @click="generateCSV">
                  Télécharger
                </PrimaryButton></template
              >
            </ConfirmationPopUp>
          </div>

          <div v-else class="empty">
            <span
              >Quand vous débloquerez des profils, ils apparaîtront ici.</span
            >
            <PrimaryButton button-type="dark" @click="navigateTo('/recherche')">
              Débloquer des profils
            </PrimaryButton>
          </div>

          <div class="table" v-if="persons.length > 0">
            <div class="table__header">
              <span
                class="checkbox"
                :class="{ 'checkbox--checked': isBoxChecked }"
                @click="selectTenBoxes"
              >
                <IconComponent
                  :icon="`check`"
                  color="#fffdfa"
                  v-if="isBoxChecked"
                />
              </span>

              <span class="table__header__cell">Prénom</span>
              <span class="table__header__cell">Nom</span>
              <span class="table__header__cell">Lieu de décès</span>
              <span class="table__header__cell">Proches trouvés</span>
              <button class="button--tertiary-dark" @click="toggleConfirmation">
                <IconComponent icon="trash" />
              </button>
            </div>
            <div class="table__body">
              <div
                class="table__body__row"
                v-for="(person, index) in persons"
                :key="person.id"
                :class="{ 'table__body__row--selected': boxArray[index] }"
                @click="
                  navigateTo(person.id, {
                    open: {
                      target: '_blank',
                    },
                  })
                "
              >
                <span
                  class="checkbox"
                  :class="{ 'checkbox--checked': boxArray[index] }"
                  @click.stop="updateBox(index, !boxArray[index])"
                >
                  <IconComponent
                    :icon="`check`"
                    color="#fffdfa"
                    v-if="boxArray[index]"
                  />
                </span>

                <div class="table__body__row__cell">
                  {{ person.firstnames }}
                </div>
                <div class="table__body__row__cell">{{ person.lastname }}</div>
                <div class="table__body__row__cell">
                  {{ person.current_death_com_name }} ({{
                    person.current_death_dep_code
                  }})
                </div>
                <div class="table__body__row__cell">
                  <div v-if="getRelativesCount(person.id) > 0">
                    <IconComponent icon="user" />
                    {{ getRelativesCount(person.id) }}
                  </div>

                  <IconComponent
                    icon="check-circle"
                    v-if="person.status === 'success'"
                    color="green"
                  />
                  <IconComponent
                    icon="rotate-cw"
                    v-if="person.status === 'error'"
                    color="red"
                    v-tooltip:left="'Erreur, cliquez pour réessayer'"
                    @click.stop="processPerson(person)"
                  />
                  <IconComponent
                    icon="loader"
                    v-if="person.status === 'loading'"
                    color="purple"
                    v-tooltip:left="'Chargement, ne pas fermer cette page'"
                  />
                </div>
                <span width="60px"></span>
              </div>
            </div>
          </div>
        </div>
        <div class="disclaimer">
          <span class="subtitles">Comment utiliser ces données au mieux ?</span>
          <span
            >Des conseils vous attendent sur notre
            <NuxtLink to="/blog" class="button--tertiary-light">blog</NuxtLink>.
            Vous pouvez aussi
            <NuxtLink to="/mon-compte#scanner" class="button--tertiary-light"
              >tester vos emails</NuxtLink
            >
            avant de les envoyer !</span
          >
        </div>

        <DashboardWidgetsEmailScanner id="scanner" />
        <div class="statistics">
          <div class="statistics__card">
            <span class="titles">
              {{ averageRelativesPerPerson.toFixed(2) }}
            </span>
            <span class="paragraphs">
              <IconComponent icon="user" /> Proches trouvés par personne en
              moyenne</span
            >
          </div>

          <div class="statistics__sponsor">
            <span class="subtitles"
              >Gagnez 10 crédits
              <span class="paragraphs">en parrainant vos amis</span></span
            >

            <div class="statistics__sponsor__wrapper">
              <span class="statistics__sponsor__wrapper__code">
                {{ isUserLoggedIn?.user.id }}
              </span>
              <PrimaryButton
                button-type="dark"
                :button-state="sharingStatus"
                @click="handleSharing(sponsorMessage)"
              >
                Partager
                <IconComponent
                  icon="share-2"
                  v-if="sharingStatus === 'default'"
                />
              </PrimaryButton>
            </div>
          </div>
        </div>
        <ul class="account-info">
          <div class="header">
            <span class="header__text">
              <IconComponent icon="info" />
              Vos informations
            </span>
          </div>
          <ul class="account-info__list">
            <li class="account-info__element">
              <IconComponent icon="credit-card" />
              {{ accountStore.$state.credits }} Crédits disponibles
            </li>
            <!-- <li class="account-info__element">
              <IconComponent icon="star" />
              Compte {{ isUserLoggedIn?.user.user_metadata.accountType }}
            </li> -->
            <li class="account-info__element">
              <IconComponent icon="mail" />
              {{ isUserLoggedIn?.user.email }}
            </li>
            <li class="account-info__element">
              <PrimaryButton
                button-type="dark"
                @click="signOut"
                class="logout-button"
              >
                Déconnexion
              </PrimaryButton>
            </li>
            <li class="account-info__element">
              <SecondaryButton button-type="dark" @click="toggleDeletionPopUp"
                >Supprimer mon compte</SecondaryButton
              >
            </li>

            <ConfirmationPopUp
              v-if="showDeletionPopUp"
              @close-confirmation="toggleDeletionPopUp"
            >
              En supprimant votre compte, vous perdrez toutes les données
              associées, sans possibilité de les récupérer. Pensez à exporter
              vos données avant de continuer.
              <template #button>
                <PrimaryButton
                  button-type="dark"
                  @click="showDeletionPopUp = !showDeletionPopUp"
                >
                  Annuler la suppression
                </PrimaryButton>
                <SecondaryButton
                  button-type="dark"
                  :button-state="deletionStatus"
                  @click="handleUserDeletion()"
                >
                  J'ai compris, supprimez mon compte
                </SecondaryButton>
              </template>
            </ConfirmationPopUp>
          </ul>
        </ul>
      </div>
    </Container>
  </template>
  <template v-if="!isUserLoggedIn?.user.aud">
    <MustBeAuthenticated />
  </template>
</template>

<style lang="scss" scoped>
.table__body {
  overflow-x: scroll;
}
.lists {
  display: flex;
  gap: 4rem;
  flex-direction: column;

  @media (min-width: $laptop-screen) {
    justify-content: space-between;
  }

  .account-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    &__element {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;

      &__icon {
        opacity: 0.6;
      }
    }

    .logout-button {
      margin-top: 1rem;
    }
  }

  .unlocked-persons {
    white-space: nowrap;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    list-style: none;

    .empty {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      text-align: center;
      gap: 2rem;
    }
  }

  .account-info,
  .unlocked-persons {
    .header {
      display: flex;
      gap: 1rem;
      background-color: $primary-color;
      padding: 1rem;
      border-radius: $radius;
      flex-wrap: wrap;

      &__text {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        white-space: nowrap;
      }
    }
  }

  .account-info {
    .header {
      margin-bottom: 1rem;
    }
  }
}

.table-row-container {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
  max-height: 40dvh;
  overflow-y: scroll;
}

.statistics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;

  &__card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: $radius;
    background-color: $primary-color;
    text-align: center;
  }

  &__sponsor {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    // text-align: center;
    grid-column: span 2;
    text-align: center;
    text-wrap: balance;
    background-color: $primary-color;
    border-radius: $radius;
    box-shadow: $shadow-black;

    &__wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
      flex-direction: column;
      padding: 0.5rem;

      @media (min-width: $big-tablet-screen) {
        flex-direction: row;
      }

      &__code {
        padding: 0.5rem;
        font-size: $small-text;

        @media (min-width: $big-tablet-screen) {
          background-color: none;
          box-shadow: none;
          border-radius: none;
          padding: 0;
        }
      }
    }
  }
}

.button--tertiary-dark {
  margin-left: auto;
}
</style>
