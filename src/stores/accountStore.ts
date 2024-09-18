import { defineStore } from "pinia";
import dayjs from "dayjs";
import { fetchUserById } from "@/utils/supabase";

export const useAccountStore = defineStore({
  id: "accountStore",
  state: () => ({
    credits: 0,
    accountType: "",
    lastCreditUpdate: null as string | null,
    currentDate: new Date().toISOString(),
  }),
  actions: {
    updateAccountType(accountType: string) {
      this.accountType = accountType;
    },
    updateLastCreditUpdate(date: string | null) {
      this.lastCreditUpdate = date;
    },
    creditsFromDB(id: string) {
      fetchUserById(id).then((data) => {
        this.credits = data.credits;
      });
    },
    updateCredits() {
      const currentDate = dayjs(this.currentDate);
      const lastUpdate = this.lastCreditUpdate
        ? dayjs(this.lastCreditUpdate)
        : null;

      if (lastUpdate && currentDate.diff(lastUpdate, "month") >= 1) {
        if (this.accountType === "gratuit") {
          if (this.credits < 10) {
            this.credits = 10;
            this.updateLastCreditUpdate(currentDate.toISOString());
          }
        } else if (this.accountType === "premium") {
          if (this.credits < 100) {
            this.credits = 100;
            this.updateLastCreditUpdate(currentDate.toISOString());
          }
        }
      }
    },
  },
});
