import { create } from "zustand"

export const useUiStore = create((set) => ({
  sidebarOpen: true,
  inventoryFilters: { search: "", category: "all", status: "all", sort: "expiration" },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setInventoryFilter: (key, value) =>
    set((s) => ({ inventoryFilters: { ...s.inventoryFilters, [key]: value } })),
  resetInventoryFilters: () =>
    set({ inventoryFilters: { search: "", category: "all", status: "all", sort: "expiration" } }),
}))
