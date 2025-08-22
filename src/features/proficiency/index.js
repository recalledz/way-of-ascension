import { proficiencyState } from "./state.js";

export const ProficiencyFeature = {
  key: "proficiency",
  initialState: () => ({ ...proficiencyState, _v: 0 }),
};
