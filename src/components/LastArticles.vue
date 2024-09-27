<script setup lang="ts">
import { ref } from "vue";

const story = await useAsyncStoryblok("blog", {
  version: "published",
});

const currentSlide = ref(0);

const nextSlide = () => {
  if (currentSlide.value < story.value.content.articles.length) {
    currentSlide.value++;
  }
  const slide = document.querySelectorAll(".slide")[currentSlide.value];

  slide?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "center",
  });
};

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  }
  const slide = document.querySelectorAll(".slide")[currentSlide.value];

  slide?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "center",
  });
};
</script>

<template>
  <div class="last-articles" v-if="story.content.articles.length > 3">
    <h3 class="subtitles" style="text-align: center">Nos derniers articles</h3>
    <div class="carousel-wrapper">
      <div
        class="carousel"
        :style="{
          transform: `translateX(-${currentSlide * 308}px)`,
        }"
      >
        <div
          class="slide"
          v-for="(article, index) in story.content.articles"
          :key="index"
        >
          <img :src="article.preview.filename" :alt="article.preview.alt" />
          <h4 class="subtitles">{{ article.title }}</h4>
          <p class="paragraphs">{{ article.description }}</p>
        </div>
      </div>
    </div>
    <div class="slides-pagination">
      <Transition>
        <span
          class="slides-pagination__stroke"
          @click="prevSlide"
          v-show="currentSlide > 0"
        ></span
      ></Transition>
      <span
        class="slides-pagination__stroke slides-pagination__stroke--selected"
      ></span>

      <Transition>
        <span
          class="slides-pagination__stroke"
          @click="nextSlide"
          v-show="currentSlide < story.content.articles.length - 3"
        ></span
      ></Transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
.last-articles {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem 1rem;
  background-color: $secondary-color;
  color: $text-color-alt;

  @media (min-width: $big-tablet-screen) {
    padding: 4rem 2rem;
  }

  .carousel-wrapper {
    display: flex;
    gap: 1rem;
    overflow-x: scroll;
    border-radius: $radius;
    max-width: 980px;

    @media (min-width: $big-tablet-screen) {
      overflow-x: hidden;
    }
  }

  .carousel {
    display: flex;
    transition: transform 0.5s ease-in-out;
    gap: 1rem;
    border-radius: $radius;
  }

  .slide {
    max-width: 300px;
    min-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: $radius;
    }
  }

  .slides-pagination {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    padding-top: 2rem;
    display: none;

    @media (min-width: $big-tablet-screen) {
      display: inherit;
    }

    &__stroke {
      display: flex;
      width: 47px;
      height: 47px;
      align-items: center;
      cursor: pointer;
      opacity: 0.5;

      &::after {
        content: "";
        display: block;
        height: 4px;
        background-color: $primary-color;
        border-radius: 10px;
        width: 100%;
      }

      &--selected {
        // background-color: $primary-color;
        cursor: default;
        opacity: 1;
      }
    }
  }
}
</style>
