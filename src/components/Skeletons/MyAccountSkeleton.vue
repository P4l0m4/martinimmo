<template>
  <Container>
    <SkeletonsSkeleton />
    <div class="lists">
      <div class="account-info">
        <SkeletonsSkeleton
          :height="60"
          :max-width="400"
          style="margin-bottom: 1rem"
        />
        <SkeletonsSkeleton :height="200" />
        <SkeletonsSkeleton :height="60" style="margin-top: 1rem" />
      </div>
      <div class="unlocked-persons">
        <SkeletonsSkeleton :height="60" style="margin-bottom: 1rem" />
        <SkeletonsSkeleton :height="82" />
        <SkeletonsSkeleton :height="82" />
        <SkeletonsSkeleton :height="82" />
        <SkeletonsSkeleton :height="82" />
        <SkeletonsSkeleton :height="82" />
      </div>
    </div>
  </Container>
</template>

<style lang="scss" scoped>
.lists {
  display: flex;
  gap: 4rem;
  flex-direction: column;

  @media (min-width: $laptop-screen) {
    flex-direction: row;
    justify-content: space-between;
  }

  .account-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;

    @media (min-width: $big-tablet-screen) {
      width: 30%;
    }
  }
  .unlocked-persons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
}
</style>
