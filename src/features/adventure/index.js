import { adventureState } from "./state.js";
import { selectProgress } from "../../shared/selectors.js";

export const AdventureFeature = {
  key: "adventure",
  initialState: () => ({ ...adventureState, _v: 0 }),
  nav: {
    visible(root) {
      return selectProgress.mortalStage(root) >= 5;
    },
  },
};
