import { sectState } from "./state.js";

export const SectFeature = {
  key: "sect",
  initialState: () => ({ ...sectState, _v: 0 }),
};
