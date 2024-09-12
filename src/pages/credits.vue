<script setup lang="ts">
import { ref, onMounted } from "vue";
import { loadStripe } from "@stripe/stripe-js";
import { checkExistingToken, addCredits } from "@/utils/supabase";

const isUserLoggedIn = ref();

const config = useRuntimeConfig();

const stripeKey = config.public.STRIPE_PUBLIC_KEY;

const stripePromise = loadStripe(stripeKey);

const items = ref([{ id: 1, quantity: 1 }]);
const clientSecret = ref<string | null>(null);
const cardElement = ref(null);

const errors = ref<string[]>([]);

async function createPaymentIntent() {
  try {
    const response = await fetch(
      "https://martinimmo-backend.vercel.app/create-payment-intent/" +
        isUserLoggedIn.value.user.id,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.value,
        }),
      }
    );

    const data = await response.json();
    clientSecret.value = data.clientSecret;
    // console.log("Payment Intent:", data.clientSecret);
  } catch (error) {
    console.error("Error creating payment intent:", error);
  }
}

// const body = {
//   id: "evt_3PyDZ9HEhqjOTS300xiy0c6s",
//   object: "event",
//   api_version: "2022-08-01",
//   created: 1726150030,
//   data: {
//     object: {
//       id: "pi_3PyDZ9HEhqjOTS300KQVPmfs",
//       object: "payment_intent",
//       amount: 100,
//       amount_capturable: 0,
//       amount_details: {
//         tip: {},
//       },
//       amount_received: 100,
//       application: null,
//       application_fee_amount: null,
//       automatic_payment_methods: {
//         allow_redirects: "always",
//         enabled: true,
//       },
//       canceled_at: null,
//       cancellation_reason: null,
//       capture_method: "automatic_async",
//       charges: {
//         object: "list",
//         data: [
//           {
//             id: "ch_3PyDZ9HEhqjOTS300oylKhen",
//             object: "charge",
//             amount: 100,
//             amount_captured: 100,
//             amount_refunded: 0,
//             application: null,
//             application_fee: null,
//             application_fee_amount: null,
//             balance_transaction: null,
//             billing_details: {
//               address: {
//                 city: null,
//                 country: null,
//                 line1: null,
//                 line2: null,
//                 postal_code: null,
//                 state: null,
//               },
//               email: null,
//               name: null,
//               phone: null,
//             },
//             calculated_statement_descriptor: "FRANCE",
//             captured: true,
//             created: 1726150029,
//             currency: "eur",
//             customer: null,
//             description: null,
//             destination: null,
//             dispute: null,
//             disputed: false,
//             failure_balance_transaction: null,
//             failure_code: null,
//             failure_message: null,
//             fraud_details: {},
//             invoice: null,
//             livemode: true,
//             metadata: {},
//             on_behalf_of: null,
//             order: null,
//             outcome: {
//               network_status: "approved_by_network",
//               reason: null,
//               risk_level: "normal",
//               seller_message: "Payment complete.",
//               type: "authorized",
//             },
//             paid: true,
//             payment_intent: "pi_3PyDZ9HEhqjOTS300KQVPmfs",
//             payment_method: "pm_1PyDfnHEhqjOTS30s8XABW8g",
//             payment_method_details: {
//               card: {
//                 amount_authorized: 100,
//                 authorization_code: "297665",
//                 brand: "mastercard",
//                 checks: {
//                   address_line1_check: null,
//                   address_postal_code_check: null,
//                   cvc_check: "pass",
//                 },
//                 country: "FR",
//                 exp_month: 6,
//                 exp_year: 2027,
//                 extended_authorization: {
//                   status: "disabled",
//                 },
//                 fingerprint: "z4YDIa0mIQ9EIvxW",
//                 funding: "credit",
//                 incremental_authorization: {
//                   status: "unavailable",
//                 },
//                 installments: null,
//                 last4: "9181",
//                 mandate: null,
//                 multicapture: {
//                   status: "unavailable",
//                 },
//                 network: "mastercard",
//                 network_token: {
//                   used: false,
//                 },
//                 overcapture: {
//                   maximum_amount_capturable: 100,
//                   status: "unavailable",
//                 },
//                 three_d_secure: {
//                   authentication_flow: "frictionless",
//                   electronic_commerce_indicator: "02",
//                   exemption_indicator: null,
//                   result: "authenticated",
//                   result_reason: null,
//                   transaction_id: "80a3ffb3-fa1d-4be1-aceb-ed6a071c5e2c",
//                   version: "2.2.0",
//                 },
//                 wallet: null,
//               },
//               type: "card",
//             },
//             receipt_email: null,
//             receipt_number: null,
//             receipt_url:
//               "https://pay.stripe.com/receipts/payment/CAcQARoXChVhY2N0XzFMeHBYRkhFaHFqT1RTMzAojuuLtwYyBv2Iu_nGvzosFlrjSPPSl68LHdgMDLRIlRlN9TLklmSWo1pYZpqrx3zp8Jbj7tM6qxShfm0",
//             refunded: false,
//             refunds: {
//               object: "list",
//               data: [],
//               has_more: false,
//               total_count: 0,
//               url: "/v1/charges/ch_3PyDZ9HEhqjOTS300oylKhen/refunds",
//             },
//             review: null,
//             shipping: null,
//             source: null,
//             source_transfer: null,
//             statement_descriptor: null,
//             statement_descriptor_suffix: null,
//             status: "succeeded",
//             transfer_data: null,
//             transfer_group: null,
//           },
//         ],
//         has_more: false,
//         total_count: 1,
//         url: "/v1/charges?payment_intent=pi_3PyDZ9HEhqjOTS300KQVPmfs",
//       },
//       client_secret:
//         "pi_3PyDZ9HEhqjOTS300KQVPmfs_secret_CrU8hZQFYOWxhsPvie34MknyV",
//       confirmation_method: "automatic",
//       created: 1726149611,
//       currency: "eur",
//       customer: null,
//       description: null,
//       invoice: null,
//       last_payment_error: null,
//       latest_charge: "ch_3PyDZ9HEhqjOTS300oylKhen",
//       livemode: true,
//       metadata: {},
//       next_action: null,
//       on_behalf_of: null,
//       payment_method: "pm_1PyDfnHEhqjOTS30s8XABW8g",
//       payment_method_configuration_details: {
//         id: "pmc_1PskxbHEhqjOTS30Q6pWzsUL",
//         parent: null,
//       },
//       payment_method_options: {
//         bancontact: {
//           preferred_language: "en",
//         },
//         card: {
//           installments: null,
//           mandate_options: null,
//           network: null,
//           request_three_d_secure: "automatic",
//         },
//         eps: {},
//         giropay: {},
//         ideal: {},
//         klarna: {
//           preferred_locale: null,
//         },
//         link: {
//           persistent_token: null,
//         },
//       },
//       payment_method_types: [
//         "card",
//         "bancontact",
//         "eps",
//         "giropay",
//         "ideal",
//         "klarna",
//         "link",
//       ],
//       processing: null,
//       receipt_email: null,
//       review: null,
//       setup_future_usage: null,
//       shipping: null,
//       source: null,
//       statement_descriptor: null,
//       statement_descriptor_suffix: null,
//       status: "succeeded",
//       transfer_data: null,
//       transfer_group: null,
//     },
//   },
//   livemode: true,
//   pending_webhooks: 1,
//   request: {
//     id: null,
//     idempotency_key:
//       "pi_3PyDZ9HEhqjOTS300KQVPmfs-payatt_3PyDZ9HEhqjOTS300lggcGGu",
//   },
//   type: "payment_intent.succeeded",
// };

// async function test() {
//   try {
//     const response = await fetch("http://localhost:3001/webhook", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         body: body,
//       }),
//     });

//     const data = await response.json();
//     console.log(data);
//   } catch (error) {
//     console.error("Error creating payment intent:", error);
//   }
// }

async function setupStripe() {
  const stripe = await stripePromise;
  if (!stripe) {
    console.error("Stripe.js failed to load.");
    return;
  }

  const elements = stripe.elements();
  const card = elements.create("card");
  card.mount("#card-element");
  cardElement.value = card;
}

async function confirmPayment() {
  const stripe = await stripePromise;
  if (!clientSecret.value || !stripe) return;

  const { error, paymentIntent } = await stripe.confirmCardPayment(
    clientSecret.value,
    {
      payment_method: {
        card: cardElement.value,
      },
    }
  );

  if (error) {
    console.error("Payment failed:", error.message);
    errors.value.push(error.message);
  } else if (paymentIntent && paymentIntent.status === "succeeded") {
    console.log("Payment succeeded:", paymentIntent);
    // addCredits(isUserLoggedIn.value.user.id, 100);
  }
}

onMounted(async () => {
  isUserLoggedIn.value = await checkExistingToken();
  createPaymentIntent();

  setupStripe();
});
</script>

<template>
  <Container>
    <!-- <button @click="test">Test</button> -->
    <div id="card-element"></div>
    <div class="form">
      <PrimaryButton
        button-type="dark"
        @click="confirmPayment"
        v-if="clientSecret"
      >
        Acheter 100 crédits
      </PrimaryButton>
      <span v-for="error in errors">{{ error }}</span>
    </div></Container
  >
</template>

<style scoped lang="scss">
#card-element {
  max-width: 400px;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: auto;
  width: 100%;
}
</style>
