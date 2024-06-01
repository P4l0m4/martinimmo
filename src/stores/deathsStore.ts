import { defineStore } from "pinia";

export const useDeathStore = defineStore({
  id: "deathStore",
  state: () => ({
    records: [],
  }),
  actions: {
    async fetchData() {
      try {
        const response = await fetch(
          "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/liste-des-personnes-decedees-en-france/records?limit=20&refine=death_date%3A%222024%2F04%22"
        );
        const data = await response.json();
        this.records = data.results;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
  },
});
