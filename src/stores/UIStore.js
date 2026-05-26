import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  marketSummaryVisible: true,
  marketSubtypeSummaryVisible: true,
  marketStatsTableVisible: true,
  backCoverPageVisible: true,
};

const useUIStore = create(
  persist(
    (set) => ({
      ...initialState,
      setMarketSummaryVisible: (visible) => set({ marketSummaryVisible: visible }),
      setMarketSubtypeSummaryVisible: (visible) => set({ marketSubtypeSummaryVisible: visible }),
      setMarketStatsTableVisible: (visible) => set({ marketStatsTableVisible: visible }),
      setBackCoverPageVisible: (visible) => set({ backCoverPageVisible: visible }),
      toggleMarketSummary: () =>
        set((state) => ({
          marketSummaryVisible: !state.marketSummaryVisible,
        })),
      toggleMarketSubtypeSummary: () =>
        set((state) => ({
          marketSubtypeSummaryVisible: !state.marketSubtypeSummaryVisible,
        })),
      toggleMarketStatsTable: () =>
        set((state) => ({
          marketStatsTableVisible: !state.marketStatsTableVisible,
        })),
      toggleBackCoverPage: () =>
        set((state) => ({
          backCoverPageVisible: !state.backCoverPageVisible,
        })),
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
