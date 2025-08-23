import { alchemyState } from "./state.js";

export const AlchemyFeature = {
  key: "alchemy",
  initialState: () => ({ ...alchemyState, _v: 0 }),
};
