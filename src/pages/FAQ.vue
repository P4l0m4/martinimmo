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
    <CollapsibleCard
      v-for="(question, i) in story.content.questions"
      :preview="question.title"
      :index="i"
      :cardOpened="questionOpened"
      @openCardEmit="toggleQuestion(i)"
      ><div
        class="faq-card__body"
        :class="{ 'faq-card__body--show': questionOpened === i }"
        v-html="renderRichText(question.answer)"
      ></div
    ></CollapsibleCard>
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

.faq-card__body {
  display: none;

  & :deep(a) {
    color: $secondary-color;
    text-decoration: underline;
  }

  &--show {
    display: initial;
  }
}

.rotate {
  transform: rotate(45deg);
}
</style>
