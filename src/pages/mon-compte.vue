<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  checkExistingToken,
  signOut,
  deleteSavedContactByID,
  fetchDeadPersonInfoFromDB,
  addFamillyToDB,
  getFamillyByDeceasedId,
} from "@/utils/supabase";
import { copyToClipboard } from "@/utils/copyToClipboard";
import { fetchPerplexityData, validateEmail } from "@/utils/APIData";
import { useAccountStore } from "@/stores/accountStore";
import { useToggle } from "@vueuse/core";
import { generateEmailAddresses } from "@/utils/emailPatterns";
import { normalizeString } from "@/utils/normalize";
import { removeMatchingNames } from "@/utils/dataSanitization";
import { sleep } from "@/utils/sleep";
import type { FamilyMember } from "@/components/FamilyMember.vue";
import SecondaryButton from "~/components/SecondaryButton.vue";

interface DeadPerson {
  id: string;
  firstnames: string;
  lastname: string;
  current_death_com_name: string;
  current_death_dep_code: string;
  hasFamilyInDB: boolean;
  status: "idle" | "loading" | "success" | "error";
}

const [showConfirmation, toggleConfirmation] = useToggle();
const accountStore = useAccountStore();

const isUserLoggedIn = ref();
interface Count {
  id: string;
  count: number;
}
const persons = ref<DeadPerson[]>([]);
const relativesCountByPerson = ref<Count[]>([]);

const loading = ref(false);
const APIData = ref([]);

const allFamilyMembers = ref<FamilyMember[]>([]);

const isBoxChecked = ref(false);
const boxArray = ref<boolean[]>([]);

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

function generateCSV() {
  const csv = persons.value
    .map((person) => {
      return `${person.firstnames},${person.lastname},${person.current_death_com_name},${person.current_death_dep_code}`;
    })
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "contacts.csv";
  a.click();
}

async function getAllFamilyMembers() {
  for (const person of persons.value) {
    const familyMembers = await getFamillyByDeceasedId(person.id);
    allFamilyMembers.value.push(...familyMembers);
  }
  console.log("All family members:", allFamilyMembers.value);
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

onMounted(async () => {
  loading.value = true;
  isUserLoggedIn.value = await checkExistingToken();

  if (isUserLoggedIn.value) {
    accountStore.creditsFromDB(isUserLoggedIn.value.user.id);
  }
  await getPersonsFromDB();
  loading.value = false;
  await findFamily();
  await getAllFamilyMembers();

  boxArray.value = persons.value.map(() => false);
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
              Vos contacts débloqués
            </span>
            <SecondaryButton
              button-type="dark"
              @click="generateCSV()"
              :button-state="loading"
            >
              <IconComponent icon="download" /> Exporter
            </SecondaryButton>

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
          </div>

          <div v-else class="empty">
            <span
              >Quand vous débloquerez des contacts, ils apparaîtront ici.</span
            >
            <PrimaryButton button-type="dark" @click="navigateTo('/recherche')">
              Débloquer des contacts
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
                @click="navigateTo(person.id)"
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
        <div class="table" v-if="allFamilyMembers.length > 0">
          <div class="table__body">
            <div
              v-for="member in allFamilyMembers"
              :key="member.id"
              class="table__body__row"
            >
              <span
                class="table__body__row__cell"
                v-tooltip:top="'Cliquez pour copier le prénom'"
                @click="copyToClipboard(member.firstnames)"
              >
                {{ member.firstnames }}
              </span>
              <span
                class="table__body__row__cell"
                v-tooltip:top="'Cliquez pour copier le nom'"
                @click="copyToClipboard(member.lastname)"
              >
                {{ member.lastname }}
              </span>
              <span
                class="table__body__row__cell"
                v-tooltip:top="'Cliquez pour copier l\'email'"
                @click="copyToClipboard(member.email)"
              >
                {{ member.email }}
              </span>
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
            <li class="account-info__element">
              <IconComponent icon="star" />
              Compte {{ isUserLoggedIn?.user.user_metadata.accountType }}
            </li>
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

    // .fetching-status-indicator {
    //   display: flex;
    //   width: 1.5rem;
    //   height: 1.5rem;
    //   justify-content: center;
    //   align-items: center;
    // }

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

.button--tertiary-dark {
  margin-left: auto;
}
</style>
