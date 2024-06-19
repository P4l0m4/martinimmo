import { defineStore } from "pinia";
import regions from "~/utils/regions.json";

export const useDeathStore = defineStore({
  id: "deathStore",
  state: () => ({
    records: [],
    region: "",
    department: "",
    param: "",
    regions: regions.regions,
  }),
  actions: {
    async fetchData() {
      try {
        const response = await fetch(
          `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/liste-des-personnes-decedees-en-france/records?limit=100&refine=death_date%3A%222024%2F04%22${this.param}
`
        );
        const data = await response.json();
        this.records = data.results;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    setRegion(region: any) {
      this.region = region ? region.url_part : "";
      this.setParam();
    },
    setDepartment(department: any) {
      this.department = department ? department.url_part : "";
      this.setParam();
    },
    setParam() {
      if (this.region !== "" && this.department !== "") {
        this.param = this.department;
      } else if (this.region !== "" && this.department === "") {
        this.param = this.region;
      }
      this.fetchData();
    },
  },
});
