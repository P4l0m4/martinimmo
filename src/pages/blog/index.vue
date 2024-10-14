<script setup lang="ts">
import { ref, onMounted } from "vue";
import { stringToSlug } from "@/utils/slugify.js";
const story = ref();
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  story.value = await useAsyncStoryblok("blog", {
    version: "published",
  });
  story.value = story.value.value;
  loading.value = false;
});
</script>
<template>
  <template v-if="loading"><SkeletonsBlogSkeleton /></template>

  <GridContainer v-else>
    <NuxtLink
      :to="'/blog/' + stringToSlug(article.title)"
      class="article-card"
      v-for="(article, index) in story?.content?.articles"
      :key="index"
    >
      <img :src="article.preview.filename" :alt="article.preview.alt" />
      <h4 class="subtitles">{{ article.title }}</h4>
      <p class="paragraphs">{{ article.description }}</p>
    </NuxtLink></GridContainer
  >
</template>
<style scoped lang="scss">
.article-card {
  width: 100%;
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
</style>
