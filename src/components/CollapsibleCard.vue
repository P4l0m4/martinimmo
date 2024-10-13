<script setup lang="ts">
defineProps<{
  preview: string;
  index: number;
  cardOpened?: number;
}>();

defineEmits(["openCardEmit"]);
</script>
<template>
  <div class="faq-card" @click="$emit('openCardEmit')">
    <div class="faq-card__header">
      <h3 class="paragraphs">{{ preview }}</h3>
      <span class="faq-card__header__button"
        ><IconComponent
          icon="plus"
          color="#fffdfa"
          size="1.25rem"
          :class="{ rotate: cardOpened === index }"
      /></span>
    </div>
    <div
      class="faq-card__body"
      :class="{ 'faq-card__body--show': cardOpened === index }"
    >
      <slot />
    </div>
    <!-- <div
      class="faq-card__body"
      :class="{ 'faq-card__body--show': cardOpened === index }"
      v-html="renderRichText(details)"
    ></div> -->
  </div>
</template>
<style lang="scss" scoped>
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
    padding: 0 0 0.5rem 0;

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
.titles,
.subtitle {
  width: 100%;

  @media (min-width: $big-tablet-screen) {
    text-align: center;
  }
}
</style>
