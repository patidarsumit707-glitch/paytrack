import mongoose, { Model } from "mongoose";

interface WeekDoc {
  weekIndex: number;
  dueDate: Date;
  amount: number;
  status: "pending" | "paid" | "skipped";
  paidAt?: Date;
}

interface HistoryDoc {
  action: "pay" | "skip";
  weekIndex: number;
  amount: number;
  timestamp: Date;
}

interface PartyDoc {
  name: string;
  totalDue: number;
  balance: number;
  schedule: WeekDoc[];
  paymentHistory: HistoryDoc[];
}

const weekSchema = new mongoose.Schema<WeekDoc>(
  {
    weekIndex: Number,
    dueDate: Date,
    amount: Number,
    status: { type: String, enum: ["pending", "paid", "skipped"], default: "pending" },
    paidAt: Date
  },
  { _id: false }
);

const historySchema = new mongoose.Schema<HistoryDoc>(
  {
    action: { type: String, enum: ["pay", "skip"], required: true },
    weekIndex: Number,
    amount: Number,
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const partySchema = new mongoose.Schema<PartyDoc>(
  {
    name: { type: String, required: true, trim: true },
    totalDue: { type: Number, required: true },
    balance: { type: Number, required: true },
    schedule: { type: [weekSchema], default: [] },
    paymentHistory: { type: [historySchema], default: [] }
  },
  { timestamps: true }
);

export const Party: Model<PartyDoc> = mongoose.models.Party || mongoose.model<PartyDoc>("Party", partySchema);
