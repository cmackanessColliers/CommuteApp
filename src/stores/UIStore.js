import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  siteFileName: null,
  employeeFileName: null,
};

const useUIStore = create(
  persist(
    (set) => ({
      ...initialState,
      setSiteFileName: (siteFileName) => {
        set({ siteFileName });
      },
      setEmployeeFileName: (employeeFileName) => set({ employeeFileName }),
      reset: () =>
        set({
          ...initialState,
          appStrategy: useUIStore.getState().appStrategy,
        }),
    }),
    {
      name: "ui-store",
      getStorage: () => localStorage,
    },
  ),
);

export default useUIStore;
