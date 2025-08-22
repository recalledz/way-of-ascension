export const activityState = {
  cultivation: false,
  physique: false,
  mining: false,
  adventure: false,
  cooking: false,
  sect: false,
};

export function initialState() {
  return { ...activityState, _v: 0 };
}
