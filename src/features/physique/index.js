import { physiqueState } from "./state.js";

export const PhysiqueFeature = {
  key: "physique",
  initialState: () => ({ ...physiqueState, _v: 0 }),
};
