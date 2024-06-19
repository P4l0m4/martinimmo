import { defineStore } from "pinia";

export const useAccountStore = defineStore({
  id: "accountStore",
  state: () => ({
    credits: 0,
  }),
  actions: {},
});
