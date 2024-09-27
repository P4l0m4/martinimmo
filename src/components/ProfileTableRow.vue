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

const isMobile = computed(() => window.innerWidth < 768);
</script>
<template>
  <Transition>
    <div
      class="table__body__row"
      :class="{ 'table__body__row--selected': isBoxChecked }"
      @click="emit('update-box', isBoxChecked)"
    >
      <div>
        <span class="checkbox" :class="{ 'checkbox--checked': isBoxChecked }"
          ><IconComponent :icon="`check`" color="#fffdfa" v-if="isBoxChecked"
        /></span>
      </div>
      <span class="table__body__row__cell">{{ formattedDeathDate }}</span>
      <span class="table__body__row__cell">
        {{ death.city }}
        <!-- <span>{{ death.departmentName }} ({{ death.departmentCode }})</span> -->
      </span>
      <span class="table__body__row__cell" v-if="!isMobile">
        {{ name.first }}
      </span>
      <span class="table__body__row__cell">
        {{ name.last }}
      </span>
    </div>
  </Transition>
</template>
