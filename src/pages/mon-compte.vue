<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  checkExistingToken,
  signOut,
  deleteAllSavedContacts,
  fetchDeadPersonInfoFromDB,
} from "@/utils/supabase";
import { fetchPerplexityData, validateEmail } from "@/utils/APIData";
import { useAccountStore } from "@/stores/accountStore";
import { useToggle } from "@vueuse/core";
import { generateEmailAddresses } from "@/utils/emailPatterns";
import { normalizeString } from "@/utils/normalize";
import { removeMatchingNames } from "@/utils/dataSanitization";
import { sleep } from "@/utils/sleep";
import type { DeadPerson, FamilyMember } from "@/components/FamilyMember.vue";

const [showConfirmation, toggleConfirmation] = useToggle();

const accountStore = useAccountStore();

const isUserLoggedIn = ref();
const emailsInDB = ref([]);
const familyMembersWithEmails = ref<FamilyMember[]>([]);
const persons = ref<DeadPerson[]>([]);

const loading = ref(false);
const perplexityFetchingStatus = ref("");
const emailsFetchingStatus = ref("");
const emailsTestingStatus = ref("");
const APIData = ref([]);

async function getDataFromPerplexity(profile: DeadPerson) {
  console.log("Fetching data from Perplexity for person:", profile);
  perplexityFetchingStatus.value = "loading";
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

    perplexityFetchingStatus.value = "success";
    APIData.value = JSON.parse(correctedJsonString);
  } catch (error) {
    console.error("Error fetching data:", error);
    perplexityFetchingStatus.value = "error";
    return;
  }
}

function sanitizeDataForPerson(person: DeadPerson) {
  console.log("Sanitizing data for person:", person);
  if (!APIData.value || APIData.value.length === 0) return [];

  const sanitized = removeMatchingNames(
    [...APIData.value],
    person.firstnames,
    person.lastname
  );

  // Add id to each family member
  sanitized.forEach((member) => {
    member.id_from_deceased = person.id;
  });

  return sanitized.length > 0 ? sanitized : [];
}

async function generateEmailAddressesForFamilyMembers(
  sanitizedFamilyMembers: any[]
) {
  emailsFetchingStatus.value = "loading";

  for (const member of sanitizedFamilyMembers) {
    const emails = generateEmailAddresses(
      normalizeString(member.first_name),
      normalizeString(member.last_name)
    );

    for (const email of emails) {
      try {
        const response = await validateEmail(email);
        if (response.deliverability === "DELIVERABLE") {
          familyMembersWithEmails.value.push({
            ...member,
            email,
          });
          break;
        }
        await sleep(1100);
      } catch (error) {
        console.error("Error validating email:", error);
        emailsFetchingStatus.value = "error";
      }
    }
  }
  await updateRelativesCountOfDeceasedPerson(
    person.id,
    familyMembersWithEmails.value.length
  );
  for (const member of familyMembersWithEmails.value) {
    try {
      await addFamillyToDB(member);
    } catch (error) {
      console.error("Failed to add family member info:", error);
    }
  }

  emailsFetchingStatus.value = "success";
}

async function findFamily() {
  for (const deadPerson of persons.value) {
    if (deadPerson.relatives_count === 0) {
      // Fetch data for the current person
      await getDataFromPerplexity(deadPerson);

      // Sanitize the data for the current person
      const sanitizedFamilyMembers = sanitizeDataForPerson(deadPerson);

      if (sanitizedFamilyMembers.length === 0) {
        console.log(
          `No family members found for person with ID: ${deadPerson.id}`
        );
        continue; // Move on to the next person if no family members are found
      }

      // Generate email addresses for the family members of the current person
      await generateEmailAddressesForFamilyMembers(sanitizedFamilyMembers);
    }
  }
}

async function getPersonsFromDB() {
  if (!isUserLoggedIn.value) return;
  const data = await fetchDeadPersonInfoFromDB(isUserLoggedIn.value.user.id);
  if (data.length === 0) return;
  console.log("Data:", data);

  for (const person of data) {
    persons.value.push(person);
  }
}

onMounted(async () => {
  loading.value = true;
  isUserLoggedIn.value = await checkExistingToken();
  loading.value = false;
  if (isUserLoggedIn.value) {
    accountStore.creditsFromDB(isUserLoggedIn.value.user.id);
  }
  await getPersonsFromDB();
  await findFamily();
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
            v-if="persons.length"
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
              ><IconComponent icon="download" /> Exporter</SecondaryButton
            >

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

          <table class="table">
            <tbody class="table__body">
              <tr
                class="table__body__row"
                v-for="person in persons"
                :key="person.id"
                @click="navigateTo(person.id)"
              >
                <td class="table__body__row__td">
                  <IconComponent icon="user" color="#232323" />
                  {{ person.firstnames }}
                </td>
                <td class="table__body__row__td">
                  <IconComponent icon="user" color="#232323" />
                  {{ person.lastname }}
                </td>
                <td class="table__body__row__td">
                  <IconComponent icon="map-pin" />
                  {{ person.current_death_com_name }} ({{
                    person.current_death_dep_code
                  }})
                </td>

                <td class="table__body__row__td">
                  <span
                    v-if="!person.relatives_count"
                    v-tooltip:left="
                      `Chargement des ${
                        emailsFetchingStatus === 'loading'
                          ? 'membres de la famille'
                          : 'membres de la famille'
                      }`
                    "
                    ><IconComponent icon="loader" color="#9600de" />{{
                      person.relatives_count
                    }}</span
                  >

                  <NuxtLink
                    v-else
                    :to="`/${person.id}`"
                    class="button--tertiary-dark"
                    v-tooltip:left="
                      'Plus d\'infos sur cette personne et les membres de sa famille'
                    "
                    >Voir plus</NuxtLink
                  >
                </td>
              </tr>
            </tbody>
          </table>
          <!-- <div class="table-row-container">
            
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
          </div> -->
        </ul>
      </div>
      <button class="button--tertiary-dark" @click="toggleConfirmation">
        <IconComponent icon="trash" /> Tout supprimer
      </button>
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
    gap: 2rem;
    width: 100%;
    list-style: none;

    .fetching-status-indicator {
      display: flex;
      width: 1.5rem;
      height: 1.5rem;
      justify-content: center;
      align-items: center;
    }

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
  padding-right: 1rem;
  max-height: 40dvh;
  overflow-y: scroll;
}

.button--tertiary-dark {
  margin-left: auto;
}
</style>
