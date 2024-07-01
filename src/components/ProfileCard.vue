<script setup lang="ts">
import { stringToSlug } from "~/utils/slugify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(relativeTime);
dayjs.extend(isBetween);

type Name = {
  first: string;
  last: string;
};

type Death = {
  age: string;
  date: string;
  departmentCode: string;
  departmentName: string;
  regionName: string;
};

const props = defineProps<{
  death?: Death;
  sex?: "M" | "F";
  name: Name;
}>();

const formattedDeathDate = computed(() => {
  return dayjs(props.death?.date).fromNow();
});
</script>
<template>
  <Transition>
    <NuxtLink
      class="profile-card scale-on-hover shadow-on-hover"
      :to="{
        name: 'recherche-slug',
        params: {
          slug: stringToSlug(
            `${name?.first} ${name?.last} ${death?.date} ${death?.departmentName}`
          ),
        },
      }"
    >
      <div class="profile-card__death">
        <span class="profile-card__death__date"
          ><IconComponent icon="clock" color="#232323" />{{
            formattedDeathDate
          }}
        </span>
        <div class="profile-card__death__location">
          <IconComponent icon="map-pin" />
          <span>{{ death.departmentName }} ({{ death.departmentCode }})</span>
        </div>
      </div>
      <div class="profile-card__names">
        <span class="profile-card__names__name">{{ name.first }}</span>

        <span class="profile-card__names__name">{{ name.last }}</span
        ><span class="sex-circle" :class="{ 'sex-circle--m': sex === 'M' }">{{
          sex === "F" ? "F" : "H"
        }}</span>
      </div>
      <Transition
        ><div class="blur">
          <IconComponent icon="unlock" color="#fffdfa" size="1.8rem" />Débloquer
        </div></Transition
      >
    </NuxtLink>
  </Transition>
</template>
<style lang="scss" scoped>
.profile-card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
  background-color: $primary-color;
  border-radius: $radius;
  position: relative;
  overflow: hidden;

  &:hover {
    .blur {
      display: flex;
    }
  }

  &__death {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;

    &__location {
      display: flex;
      align-items: top;
      gap: 0.5rem;

      &__flag {
        width: 1rem;
        height: 1rem;
      }
    }

    &__date {
      display: flex;
      align-items: top;
      gap: 0.5rem;
    }
  }

  &__names {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: auto;

    &__name {
      text-wrap: balance;
      font-size: $small-text;
    }

    & .icon {
      margin-left: auto;
    }
  }
}

.sex-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  min-width: 1rem;
  border-radius: 50%;
  background-color: $pink-color-faded;
  font-size: $small-text;
  color: $text-color-alt;
  font-weight: $thick;
  margin-left: auto;

  &--m {
    background-color: $blue-color-faded;
  }
}

.blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: none;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  background-color: $secondary-color-faded;
  backdrop-filter: blur(2px);
  z-index: 1;
  border-radius: $radius;
  font-size: 1.25rem;
  color: $text-color-alt;
  text-shadow: $shadow-text-secondary;
}
</style>
