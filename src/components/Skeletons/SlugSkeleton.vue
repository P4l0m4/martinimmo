<template>
  <Container>
    <SkeletonsSkeleton />
    <div class="column">
      <SkeletonsSkeleton /><SkeletonsSkeleton /><SkeletonsSkeleton /><SkeletonsSkeleton />
    </div>
    <SkeletonsSkeleton />
  </Container>
</template>

<style scoped lang="scss">
.column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
