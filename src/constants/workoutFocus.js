export const WORKOUT_FOCUS_OPTIONS = [
  {
    value: "Power (Speed x Force)",
    label: "Power (Speed x Force)",
    type: "power",
  },
  { value: "Strength", label: "Strength", type: "strength" },
  {
    value: "Hypertrophy (Muscle Growth)",
    label: "Hypertrophy (Muscle Growth)",
    type: "hypertrophy",
  },
  {
    value: "Muscular Endurance",
    label: "Muscular Endurance",
    type: "endurance",
  },
  {
    value: "Maximal Aerobic Output (VO2 Max)",
    label: "Maximal Aerobic Output (VO2 Max)",
    type: "aerobic",
  },
  {
    value: "Long Duration Steady State Exercise",
    label: "Long Duration Steady State Exercise",
    type: "cardio",
  },
  {
    value: "Mobility, Stability, Yoga",
    label: "Mobility, Stability, Yoga",
    type: "mobility",
  },
  { value: "Other", label: "Other", type: "other" },
];

export const getFocusType = (focus) => {
  const option = WORKOUT_FOCUS_OPTIONS.find((opt) => opt.value === focus);
  return option ? option.type : "general";
};
