export const TOTAL_WEEKS = 13;

export const startOfWeekMonday = (date = new Date()): Date => {
  const local = new Date(date);
  const day = local.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  local.setHours(0, 0, 0, 0);
  local.setDate(local.getDate() + diff);
  return local;
};

export const weekDate = (baseMonday: Date, weekIndex: number): string => {
  const d = new Date(baseMonday);
  d.setDate(d.getDate() + weekIndex * 7);
  return d.toISOString();
};

export const normalizePercentages = (percentages: number[]): number[] => {
  const cleaned = percentages.map((n) => (Number.isFinite(n) && n > 0 ? n : 0));
  const sum = cleaned.reduce((acc, v) => acc + v, 0);
  if (sum === 0) {
    const equal = 100 / TOTAL_WEEKS;
    return new Array(TOTAL_WEEKS).fill(equal);
  }

  const normalized = cleaned.map((n) => (n / sum) * 100);
  const rounded = normalized.map((n) => Number(n.toFixed(2)));
  const roundedSum = rounded.reduce((acc, v) => acc + v, 0);
  rounded[rounded.length - 1] = Number((rounded[rounded.length - 1] + (100 - roundedSum)).toFixed(2));
  return rounded;
};

export const amountFromPercentage = (totalDue: number, percentage: number): number =>
  Number(((totalDue * percentage) / 100).toFixed(2));
