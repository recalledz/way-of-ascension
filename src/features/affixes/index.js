import { affixState } from "./state.js";

export const AffixesFeature = {
  key: "affixes",
  initialState: () => ({ ...affixState, _v: 0 }),
};
