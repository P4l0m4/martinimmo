<template>
  <header class="header">
    <nav class="header__nav">
      <ul class="header__nav__ul">
        <li class="header__nav__ul__li"><NuxtLink to="/">Accueil</NuxtLink></li>
      </ul>
    </nav>
  </header>
</template>
<style lang="scss" scoped>
.header {
  display: flex;
  padding: 1rem;
  background-color: $primary-color;
  box-shadow: $shadow-black;

  &__nav {
    &__ul {
      list-style: none;
    }
  }
}
</style>
