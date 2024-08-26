<template>
  <Container>
    <SkeletonsSkeleton />
    <div class="lists">
      <div class="account-info">
        <SkeletonsSkeleton :height="60" style="margin-bottom: 1rem" />
        <SkeletonsSkeleton :height="200" />
        <SkeletonsSkeleton :height="60" style="margin-top: 1rem" />
      </div>
      <div class="account-info">
        <SkeletonsSkeleton :height="60" style="margin-bottom: 1rem" />
        <SkeletonsSkeleton :height="200" />
        <SkeletonsSkeleton :height="60" style="margin-top: 1rem" />
      </div>
      <div class="account-info">
        <SkeletonsSkeleton :height="60" style="margin-bottom: 1rem" />
        <SkeletonsSkeleton :height="200" />
        <SkeletonsSkeleton :height="60" style="margin-top: 1rem" />
      </div>
    </div>
  </Container>
</template>

<style lang="scss" scoped>
.lists {
  display: flex;
  gap: 4rem;
  flex-direction: column;

  .unlocked-persons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
}
</style>
