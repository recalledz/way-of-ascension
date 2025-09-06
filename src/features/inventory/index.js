import { inventoryState } from "./state.js";

export const InventoryFeature = {
  key: "inventory",
  initialState: () => ({ ...inventoryState, _v: 0 }),
  nav: {
    visible() {
      return true;
    },
  },
};
