// import { defineStore } from "pinia";
// import regions from "~/utils/regions.json";

// export const useDeathStore = defineStore({
//   id: "deathStore",
//   state: () => ({
//     records: [],
//     region: "",
//     department: "",
//     param: "",
//     regions: regions.regions,
//   }),
//   actions: {
//     async fetchData() {
//       try {
//         const response = await fetch(
//           `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/liste-des-personnes-decedees-en-france/records?limit=100&refine=death_date%3A%222024%2F06%22${this.param}
// `
//         );
//         const data = await response.json();
//         this.records = data.results;
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     },
//     async setRegion(region: any) {
//       this.region = region ? region.url_part : "";
//       await this.setParam(this.region);
//     },
//     async setDepartment(department: any) {
//       this.department = department ? department.url_part : "";
//       await this.setParam(this.department);
//     },
//     async setParam(param: string) {
//       this.param = param;
//       await this.fetchData();
//     },
//   },
// });

import { defineStore } from "pinia";
import { fetchAllDeadPeople, fetchDeadPeopleByRegion } from "@/utils/supabase";
import regions from "@/utils/regions.json";

export const useDeathStore = defineStore({
  id: "deathStore",
  state: () => ({
    records: [],
    region: "",
    department: "",
    city: "",
    regions: regions.regions,
    slice: [0, 200],
    totalDeadPeople: 0,
    selectedRecords: [],
  }),
  actions: {
    async fetchData() {
      try {
        if (this.city.length > 0) {
          const data = await fetchDeadPeopleByCity(this.city);
          this.records = data;
          return;
        } else if (this.department.length > 0) {
          const data = await fetchDeadPeopleByDepartment(this.department);
          this.records = data.slice(this.slice[0], this.slice[1]);
          return;
        } else if (this.region.length < 1) {
          this.getAllDeadPeople();
        } else {
          const data = await fetchDeadPeopleByRegion(this.region);
          this.records = data.slice(this.slice[0], this.slice[1]);
          this.totalDeadPeople = data.length;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    async getAllDeadPeople() {
      const data = await fetchAllDeadPeople();
      this.records = data.slice(this.slice[0], this.slice[1]);
      this.totalDeadPeople = data.length;
    },
    setSlice(slice: [number, number]) {
      this.slice = slice;
      this.fetchData();
    },
    setRegion(region: string) {
      this.region = region;
      this.fetchData();
    },
    setDepartment(department: string) {
      this.department = department;
      this.fetchData();
    },
    setCity(city: string) {
      this.city = city;
      this.fetchData();
    },
    setSelectedRecords(records: any) {
      this.selectedRecords = records;
    },
  },
});
