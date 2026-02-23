import mongoose, { Model } from "mongoose";

interface SettingsDoc {
  weekPercentages: number[];
  preset: "equal" | "frontHeavy" | "backHeavy" | "custom";
  updatedAt: Date;
}

const settingsSchema = new mongoose.Schema<SettingsDoc>(
  {
    weekPercentages: { type: [Number], required: true, default: new Array(13).fill(100 / 13) },
    preset: { type: String, enum: ["equal", "frontHeavy", "backHeavy", "custom"], default: "equal" }
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const Settings: Model<SettingsDoc> =
  mongoose.models.Settings || mongoose.model<SettingsDoc>("Settings", settingsSchema);
