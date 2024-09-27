<template>
  <Container class="centered-content" style="height: calc(100dvh - 70px)">
    <h1 class="titles">
      Ils ont des <span class="secondary-color">biens à vendre</span>,
      trouvez-les en un clic 🖱️
    </h1>
    <div class="buttons">
      <NuxtLink class="button secondary--dark" to="/recherche"
        >Commencer ma recherche</NuxtLink
      >
      <NuxtLink class="button primary--dark" to="/mon-compte"
        >Voir mes contacts débloqués</NuxtLink
      >
    </div></Container
  >
</template>
<style lang="scss" scoped>
.titles {
  max-width: 1000px;
  text-align: center;
  text-wrap: balance;
}
.buttons {
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 450px;
}
</style>
