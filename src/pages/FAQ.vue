<script setup lang="ts">
import { ref } from "vue";
const story = await useAsyncStoryblok("faq", {
  version: "published",
});

const questionOpened = ref<number>();

function toggleQuestion(i: number) {
  questionOpened.value = questionOpened.value === i ? undefined : i;
}
</script>
<template>
  <Container
    ><h1 class="titles">
      Foire <span class="secondary-color">Aux Questions</span>
    </h1>
    <h2 class="paragraphs subtitle">
      Une question sur l'utilisation de la plateforme, sur les données... ?
    </h2></Container
  ><GridContainer>
    <div
      class="faq-card"
      v-for="(question, i) in story.content.questions"
      @click="toggleQuestion(i)"
    >
      <div class="faq-card__header">
        <h3 class="paragraphs">{{ question.title }}</h3>
        <span class="faq-card__header__button"
          ><IconComponent
            icon="plus"
            color="#fffdfa"
            size="1.25rem"
            :class="{ rotate: questionOpened === i }"
        /></span>
      </div>

      <div
        class="faq-card__body"
        :class="{ 'faq-card__body--show': questionOpened === i }"
        v-html="renderRichText(question.answer)"
      ></div>
    </div>
  </GridContainer>
  <LastArticles />
</template>
<style lang="scss" scoped>
.titles,
.subtitle {
  width: 100%;

  @media (min-width: $big-tablet-screen) {
    text-align: center;
  }
}
.faq-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;

  border-bottom: 1px solid $border-color-faded;
  cursor: pointer;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;

    &__button {
      background-color: $secondary-color;
      width: 40px;
      min-width: 40px;
      max-width: 40px;
      height: 40px;
      max-height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      cursor: pointer;
    }
  }

  &__body {
    display: none;

    & :deep(a) {
      color: $secondary-color;
      text-decoration: underline;
    }

    &--show {
      display: initial;
    }
  }
}

.rotate {
  transform: rotate(45deg);
}
</style>
