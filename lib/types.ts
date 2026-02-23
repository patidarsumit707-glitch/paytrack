export type DistributionPreset = "equal" | "frontHeavy" | "backHeavy" | "custom";

export type WeeklyStatus = "pending" | "paid" | "skipped";

export interface WeekAllocation {
  weekIndex: number;
  dueDate: string | Date;
  amount: number;
  status: WeeklyStatus;
  paidAt?: string | Date;
}

export interface PartyDto {
  _id: string;
  name: string;
  totalDue: number;
  balance: number;
  createdAt: string;
  schedule: WeekAllocation[];
  paymentHistory: {
    action: "pay" | "skip";
    weekIndex: number;
    amount: number;
    timestamp: string;
  }[];
}

export interface SettingsDto {
  _id: string;
  weekPercentages: number[];
  preset: DistributionPreset;
  updatedAt: string;
}
