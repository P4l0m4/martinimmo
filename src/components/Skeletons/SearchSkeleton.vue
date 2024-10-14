<template>
  <Container>
    <SkeletonsSkeleton />
    <div class="grid">
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
      <SkeletonsSkeleton :height="40" />
    </div>
  </Container>
</template>

<style scoped lang="scss">
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  width: 100%;
  gap: 1rem;
}
</style>
