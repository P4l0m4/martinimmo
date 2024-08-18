<script setup lang="ts">
import { computed } from "vue";
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
  city: string;
  departmentCode: string;
  departmentName: string;
  regionName: string;
};

const props = defineProps<{
  death?: Death;
  sex?: "M" | "F";
  name: Name;
  uuid: string;
  index: number;
  boxArray: boolean[];
}>();

const emit = defineEmits(["update-box"]);

const formattedDeathDate = computed(() => {
  return dayjs(props.death?.date).fromNow();
});

const isBoxChecked = computed({
  get: () => props.boxArray[props.index],
  set: (value: boolean) => emit("update-box", value),
});
</script>
<template>
  <Transition>
    <tr
      class="table__body__row"
      :class="{ 'table__body__row--selected': isBoxChecked }"
      @click="emit('update-box', isBoxChecked)"
    >
      <!-- <NuxtLink
        class="table__body scale-on-hover shadow-on-hover"
        :to="{
          name: 'recherche-slug',
          params: {
            slug: props.uuid,
          },
        }"
      > -->

      <td style="padding-left: 0.5rem">
        <span class="checkbox" :class="{ 'checkbox--checked': isBoxChecked }"
          ><IconComponent :icon="`check`" color="#fffdfa" v-if="isBoxChecked"
        /></span>
      </td>
      <td class="table__body__row__td">
        <span class="table__body__row__td__date"
          >{{ formattedDeathDate }}
        </span>
      </td>
      <td class="table__body__row__td__location">
        {{ death.city }}
        <!-- <span>{{ death.departmentName }} ({{ death.departmentCode }})</span> -->
      </td>
      <td class="table__body__name">
        {{ name.first }}

        <!-- <span class="sex-circle" :class="{ 'sex-circle--m': sex === 'M' }">{{
          sex === "F" ? "F" : "H"
        }}</span> -->
      </td>
      <td class="table__body__name">
        {{ name.last }}
      </td>

      <!-- </NuxtLink> -->
    </tr>
  </Transition>
</template>
<style lang="scss" scoped>
.table__body__name {
  text-wrap: balance;
  font-size: $small-text;

  & .icon {
    margin-left: auto;
  }
}
</style>
