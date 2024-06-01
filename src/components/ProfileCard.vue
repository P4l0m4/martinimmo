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
  death: Death;
  sex: "M" | "F";
  name: Name;
}>();

const formattedDeathDate = computed(() => {
  return dayjs(props.death?.date).fromNow();
});

const profileLink = computed(() => {
  return `/${stringToSlug(
    `${props.name?.first} ${props.name?.last} ${props.death.date} ${props.death?.departmentName}`
  )}`;
});
</script>
<template>
  <Transition>
    <NuxtLink class="profile-card scale-on-hover" :to="profileLink">
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
        ><IconComponent
          class="icon"
          :icon="sex === 'F' ? 'female' : 'male'"
          :color="sex === 'F' ? 'pink' : 'blue'"
        />
      </div>
    </NuxtLink>
  </Transition>
</template>
<style lang="scss" scoped>
.profile-card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
  box-shadow: $shadow;
  background-color: $primary-color;
  border-radius: $radius;

  &__death {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;

    &__location {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &__flag {
        width: 1rem;
        height: 1rem;
      }
    }

    &__date {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }

  &__names {
    display: flex;
    align-items: end;
    gap: 0.5rem;
    margin-top: auto;

    &__name {
      text-wrap: balance;
    }

    & .icon {
      margin-left: auto;
    }
  }
}
</style>
