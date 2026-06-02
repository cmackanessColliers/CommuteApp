import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  siteFileName: null,
  employeeFileName: null,
  configReady: false,
};

const useUIStore = create(
  persist(
    (set) => ({
      ...initialState,
      setSiteFileName: (siteFileName) => {
        set({ siteFileName });
      },
      setEmployeeFileName: (employeeFileName) => set({ employeeFileName }),
      setConfigReady: () => set({ configReady: true }),
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
