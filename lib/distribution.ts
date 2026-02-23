import { TOTAL_WEEKS, amountFromPercentage, normalizePercentages, startOfWeekMonday, weekDate } from "@/lib/date";
import { WeekAllocation } from "@/lib/types";

const rebalanceFinalWeek = (allocations: WeekAllocation[], totalDue: number) => {
  const sum = allocations.reduce((acc, week) => acc + week.amount, 0);
  const delta = Number((totalDue - sum).toFixed(2));
  allocations[allocations.length - 1].amount = Number(
    (allocations[allocations.length - 1].amount + delta).toFixed(2)
  );
};

export const buildSchedule = (totalDue: number, percentages: number[]): WeekAllocation[] => {
  const normalized = normalizePercentages(percentages);
  const monday = startOfWeekMonday();

  const schedule = new Array(TOTAL_WEEKS).fill(null).map((_, weekIndex) => ({
    weekIndex,
    dueDate: weekDate(monday, weekIndex),
    amount: amountFromPercentage(totalDue, normalized[weekIndex]),
    status: "pending" as const
  }));

  rebalanceFinalWeek(schedule, totalDue);
  return schedule;
};

export const applySkipRedistribution = (
  currentSchedule: WeekAllocation[],
  currentWeekIndex: number,
  weekPercentages: number[]
): WeekAllocation[] => {
  const updated = currentSchedule.map((week) => ({ ...week }));
  const currentWeek = updated[currentWeekIndex];
  if (!currentWeek || currentWeek.status === "paid") return updated;

  currentWeek.status = "skipped";
  currentWeek.amount = 0;

  const futureWeeks = updated.filter((week) => week.weekIndex > currentWeekIndex && week.status !== "paid");
  if (futureWeeks.length === 0) {
    return updated;
  }

  const remainingBalance = Number(
    updated
      .filter((week) => week.status === "pending")
      .reduce((acc, week) => acc + week.amount, 0)
      .toFixed(2)
  );

  const futurePercentages = futureWeeks.map((week) => weekPercentages[week.weekIndex] ?? 0);
  const normalizedFuture = normalizePercentages(futurePercentages);

  futureWeeks.forEach((week, idx) => {
    week.amount = amountFromPercentage(remainingBalance, normalizedFuture[idx]);
    week.status = "pending";
  });

  const pendingWeeks = updated.filter((week) => week.status === "pending");
  const pendingSum = pendingWeeks.reduce((acc, week) => acc + week.amount, 0);
  const correction = Number((remainingBalance - pendingSum).toFixed(2));
  if (pendingWeeks.length > 0) {
    pendingWeeks[pendingWeeks.length - 1].amount = Number(
      (pendingWeeks[pendingWeeks.length - 1].amount + correction).toFixed(2)
    );
  }

  return updated;
};
