<template>
  <svg class="donut-chart" viewBox="0 0 100 100">
    <circle class="segment" cx="50" cy="50" r="40" />
    <circle
      v-for="(segment, index) in computedSegments"
      :key="index"
      :class="segment.color"
      :stroke-dasharray="`${segment.percent} ${circumference - segment.percent}`"
      :stroke-dashoffset="segment.offset"
      class="segment"
      cx="50"
      cy="50"
      r="40"
    />
  </svg>

  <span
    class="valid-segments-count"
    v-if="validSegmentsColor"
    :style="{ color: validSegmentsColor }"
  >
    {{ validSegments }}/{{ maxValue }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

type Segment = {
  value: number;
  color: "green" | "blue" | "purple" | "red" | "orange" | "yellow";
};

type ComputedSegment = {
  color: "green" | "blue" | "purple" | "red" | "orange" | "yellow";
  percent: number;
  offset: number;
};

const props = defineProps<{
  segments: Segment[];
  maxValue?: number;
  validSegments?: number;
}>();

const circumference = Math.PI * 80;

const totalValue = computed(() => {
  const sumOfValues = props.segments.reduce(
    (acc, segment) => acc + segment.value,
    0
  );
  return Math.max(props.maxValue ?? 0, sumOfValues);
});

const computedSegments = computed<ComputedSegment[]>(() => {
  let nextOffset = circumference / 4;
  return props.segments.map((segment) => {
    const percent = (segment.value / totalValue.value) * circumference;
    const currentSegment = {
      color: segment.color,
      percent,
      offset: nextOffset,
    };
    nextOffset -= percent;
    return currentSegment;
  });
});

const validSegmentsColor = computed(() => {
  const { validSegments, maxValue } = props;

  if (validSegments == null || maxValue == null) {
    console.error("Missing validSegments or maxValue props");
    return null; // Return null to explicitly indicate an error state
  }

  const percentage = (validSegments / maxValue) * 100;
  console.log(percentage);

  if (percentage <= 30) {
    return "red";
  } else if (percentage >= 30 && percentage <= 70) {
    return "orange";
  } else if (percentage >= 70) {
    return "green";
  } else {
    return null;
  }
});
</script>

<style scoped lang="scss">
.donut-chart {
  width: 100px;
  height: 100px;
  position: relative;
}

.segment {
  stroke: $primary-color;
  stroke-width: 10;
  fill: transparent;

  &.green {
    stroke: $success-color;
  }
  &.blue {
    stroke: $success-color;
  }
  &.purple {
    stroke: $loading-color;
  }
  &.red {
    stroke: $error-color;
  }
  &.orange {
    stroke: orange;
  }
  &.yellow {
    stroke: yellow;
  }
}

.valid-segments-count {
  font-size: 1.5rem;
  font-weight: $thick;
}
</style>
