import { normalizePercentages, TOTAL_WEEKS } from "@/lib/date";
import { DistributionPreset } from "@/lib/types";

export const presetPercentages = (preset: DistributionPreset): number[] => {
  if (preset === "equal") return new Array(TOTAL_WEEKS).fill(100 / TOTAL_WEEKS);

  if (preset === "frontHeavy") {
    const raw = Array.from({ length: TOTAL_WEEKS }, (_, i) => TOTAL_WEEKS - i + 2);
    return normalizePercentages(raw);
  }

  if (preset === "backHeavy") {
    const raw = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 3);
    return normalizePercentages(raw);
  }

  return new Array(TOTAL_WEEKS).fill(100 / TOTAL_WEEKS);
};
