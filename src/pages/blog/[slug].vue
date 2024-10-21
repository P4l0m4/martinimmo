<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { stringToSlug } from "@/utils/slugify.js";
const story = ref();
const route = useRoute();

const articleSlug = route.params.slug;
const article = ref();

const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  story.value = await useAsyncStoryblok("blog", {
    version: "published",
  });
  story.value = story.value.value;
  article.value = story.value.content.articles.find(
    (a: any) => stringToSlug(a.title) === articleSlug
  );
  loading.value = false;
});
</script>
<template>
  <template v-if="loading"><SkeletonsBlogSkeleton /></template>
  <Container v-else>
    <div
      class="article-preview-image"
      :style="{
        backgroundImage: `linear-gradient(45deg, #00065c, transparent 90%), url('${article?.preview.filename}')`,
      }"
    >
      <h1 class="titles" style="max-width: 600px">{{ article?.title }}</h1>
      <p class="paragraphs">{{ article?.description }}</p>
    </div>

    <div class="article-content" v-html="renderRichText(article?.text)"></div>
  </Container>

  <LastArticles />
</template>
<style scoped lang="scss">
.article-preview-image {
  width: 100%;
  height: calc(100dvh - 9rem);
  background-size: cover;
  background-position: center;
  padding: 1rem;
  color: $text-color-alt;
  display: flex;
  gap: 1rem;
  flex-direction: column;
  justify-content: end;
  text-wrap: balance;

  @media (min-width: $big-tablet-screen) {
    padding: 2rem;
    gap: 2rem;
  }
}
.article-content {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  line-height: 180%;

  & :deep(p) {
    font-size: 1rem;
  }
  & :deep(h1) {
    font-size: $titles;
  }
  & :deep(h2) {
    font-size: $subtitles;
    padding-bottom: 1rem;
    padding-top: 2rem;
  }
  & :deep(a) {
    color: $secondary-color;
    text-decoration: underline;
  }
  & :deep(img) {
    width: 100%;
    max-width: 100%;
    height: 400px;
    margin: 1rem 0;
    object-fit: cover;
  }
  & :deep(ul) {
    padding: 1rem 0;
    width: 100%;
    max-width: 100%;
    list-style-position: inside;
  }
  & :deep(li) {
    max-width: 100%;
    width: 100%;
  }
  & :deep(code) {
    display: block;
    width: 100%;
    max-width: 100%;
    background-color: $primary-color;
    padding: 1rem;
    border-radius: $radius;
    box-shadow: $shadow-black;
    word-break: break-all;
  }
  & :deep(blockquote) {
    padding: 1rem;
    margin-top: 1rem;
    border-left: $secondary-color-faded 4px solid;
  }
}
</style>
