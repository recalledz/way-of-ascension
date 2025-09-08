import { alchemyState } from "./state.js";
import { selectSect } from "../../shared/selectors.js";
import { tickAlchemy } from "./logic.js";
import { registerFeature } from "../registry.js";

export const AlchemyFeature = {
  key: "alchemy",
  initialState: () => ({ ...alchemyState, _v: 0 }),
  nav: {
    visible(root) {
      return selectSect.isBuildingBuilt('alchemy', root);
    },
  },
};

registerFeature({
  id: "alchemy",
  init: () => ({ ...alchemyState, _v: 0 }),
  tick: (state, stepMs) => tickAlchemy(state, stepMs),
});
