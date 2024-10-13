<script lang="ts" setup>
import { ref, computed } from "vue";
import { perplexityEmailScan } from "@/utils/APIData";
import { email } from "@vuelidate/validators";

type Segment = {
  value: number;
  color: "green" | "blue" | "purple" | "red" | "orange" | "yellow";
};

const emailObject = ref("");
const emailBody = ref("");
const scanResults = ref();
const sanitizedScanResults = ref<any[]>([]);
const loading = ref(false);
const showFields = ref(true);

const scanResultsDetails = computed(() => {
  if (!sanitizedScanResults.value) {
    console.log("no criteria found");
    return [];
  } else if (!sanitizedScanResults.value.criteria) {
    console.log("no criteria found");
    return [];
  }

  //   return sanitizedScanResults.value;

  return sanitizedScanResults.value.criteria.map((criterion: any) => {
    return {
      category: criterion.category,
      subCriteria: Object.entries(criterion.sub_criteria)
        .map(([subCriterion, value]) => {
          return {
            subCriterion,
            value,
          };
        })
        .filter((sub) => !sub.value), // only keep subCriteria with value false
    };
  });
});
const segments = computed<Segment[]>(() => {
  if (!sanitizedScanResults.value || !sanitizedScanResults.value.criteria) {
    console.log("no criteria found");
    return [];
  }

  return sanitizedScanResults.value.criteria
    .map((criterion: any) => {
      return {
        value: Object.values(criterion.sub_criteria).filter(
          (value) => value === true
        ).length,
        color: "green",
      };
    })
    .filter((segment: Segment[]) => segment.value > 0);
});

const totalValue = computed(() => {
  const sumOfValues = segments.value.reduce(
    (acc, segment) => acc + segment.value,
    0
  );
  return sumOfValues;
});
async function sendEmailScanData() {
  loading.value = true;
  try {
    scanResults.value = await perplexityEmailScan(
      emailObject.value,
      emailBody.value
    );
    const match = scanResults.value.choices[0].message.content.match(
      /```json\n([\s\S]*?)\n```/
    );

    if (!match) {
      loading.value = false;

      throw new Error("JSON content not found in response");
    }

    const jsonString = match[1].trim();
    sanitizedScanResults.value = JSON.parse(jsonString);
    loading.value = false;
    showFields.value = false;
    emailObject.value = "";
    emailBody.value = "";
  } catch (error) {
    console.error("Error parsing JSON or fetching scan data:", error);
    loading.value = false;
  }
}
</script>

<template>
  <div class="scan">
    <div class="scan__inputs" v-if="showFields">
      <h3 class="subtitles">Testez votre email</h3>
      <h4 class="paragraphs">Augmentez votre taux d'ouverture et de réponse</h4>
      <InputField
        id="email-object"
        type="text"
        v-model="emailObject"
        label="Objet du mail"
        placeholder="Objet du mail"
        name="emailObject"
        required
      />
      <textarea
        class="scan__inputs__input"
        placeholder="Corps du mail"
        v-model="emailBody"
        label="Corps du mail"
        required
      ></textarea>
    </div>

    <div class="scan__results">
      <Transition>
        <PrimaryButton
          button-type="dark"
          v-if="
            emailBody &&
            emailObject &&
            scanResultsDetails.length === 0 &&
            !loading
          "
          @click="sendEmailScanData"
          >Lancer l'analyse</PrimaryButton
        ></Transition
      >
      <h4 class="subtitles" v-if="scanResultsDetails.length > 0 && !showFields">
        Résultats de l'analyse
      </h4>

      <Transition>
        <DashboardWidgetsDonutChart
          :segments="segments"
          :max-value="20"
          :valid-segments="totalValue"
          v-if="scanResultsDetails.length > 0 && !showFields"
      /></Transition>

      <Transition
        ><DashboardWidgetsUiLoader v-if="loading" color="#00065c66"
      /></Transition>

      <PrimaryButton
        button-type="dark"
        @click="(showFields = true), (scanResultsDetails = [])"
        v-if="!showFields"
        >Nouvelle analyse</PrimaryButton
      >

      <template v-if="!showFields">
        <div
          class="scan__results__details"
          v-for="element in scanResultsDetails"
        >
          <h5 class="scan__results__details__category paragraphs">
            {{ element.category }}
          </h5>
          <ul class="scan__results__details__sub-criterion">
            <li class="paragraphs" v-for="subCriterion in element.subCriteria">
              {{ subCriterion.subCriterion }}
              <IconComponent icon="alert-circle" color="red" />
            </li>
          </ul></div
      ></template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scan {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: fit-content;

  @media (min-width: $big-tablet-screen) {
    flex-direction: row;
  }

  &__inputs {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-radius: $radius;

    &__input {
      background-color: $primary-color;

      &:nth-child(4) {
        height: 400px;
        border-radius: 20px;
        font-size: 1rem;
        color: $text-color;
        border: none;
        padding: 0.75rem;
        font-family: "Figtree", sans-serif;
        resize: none;
        box-shadow: $shadow-black;

        &::placeholder {
          color: $text-color-faded;
          font-size: 1rem;
        }
      }
    }
  }

  &__results {
    width: 100%;
    height: 100%;
    min-height: 554px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    padding: 1rem;
    color: $text-color;

    @media (min-width: $big-tablet-screen) {
      padding: 2rem;
    }

    &__details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%;

      &__category {
        font-weight: $skinny-thick;
      }

      &__sub-criterion {
        list-style: none;
      }
    }
  }
}
</style>
