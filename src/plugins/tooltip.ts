import { defineNuxtPlugin } from "#app";
import TooltipDirective from "@/directives/tooltip";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("tooltip", TooltipDirective);
});
