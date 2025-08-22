export const automationState = {
  meditate: false,
  adventure: false,
};

export function initialState() {
  return { ...automationState, _v: 0 };
}
