<script setup lang="ts"></script>
<template>
  <buttton class="menu-button">
    <IconComponent icon="sliders" color="#fffdfa" size="2rem" />
  </buttton>
</template>
<style lang="scss" scoped>
.menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $secondary-color;
  border-radius: 50%;
  position: fixed;
  //   position: relative;
  right: 1rem;
  margin-left: auto;
  top: 5.5rem;
  height: 50px;
  width: 50px;
  z-index: 3;

  @media (min-width: $big-tablet-screen) {
    display: none;
  }
}
</style>
