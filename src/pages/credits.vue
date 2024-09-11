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
      "http://localhost:3001/create-payment-intent/" +
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
  } else if (paymentIntent) {
    console.log("Payment succeeded:", paymentIntent);
    addCredits(isUserLoggedIn.value.user.id, 100);
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
    <div id="card-element" v-if="errors.length"></div>
    <div class="form">
      <PrimaryButton
        button-type="dark"
        @click="confirmPayment"
        v-if="clientSecret"
      >
        Acheter 100 crédits
      </PrimaryButton>
      <span v-if="errors.length">{{ errors[0] }}</span>
      <span v-else>{{ errors[0] }}</span>
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
