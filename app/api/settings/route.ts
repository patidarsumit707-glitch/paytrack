import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { normalizePercentages, TOTAL_WEEKS } from "@/lib/date";
import { presetPercentages } from "@/lib/settings";
import { Settings } from "@/models/Settings";

export async function GET() {
  await connectDb();
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ weekPercentages: presetPercentages("equal"), preset: "equal" });
  }
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  await connectDb();
  const body = await req.json();

  const preset = body.preset ?? "custom";
  let weekPercentages: number[] = body.weekPercentages ?? [];

  if (preset !== "custom") {
    weekPercentages = presetPercentages(preset);
  }

  if (!Array.isArray(weekPercentages) || weekPercentages.length !== TOTAL_WEEKS) {
    return NextResponse.json({ error: "13 weekly percentages are required" }, { status: 400 });
  }

  const normalized = normalizePercentages(weekPercentages);

  const settings = await Settings.findOneAndUpdate(
    {},
    { weekPercentages: normalized, preset },
    { upsert: true, new: true }
  );

  return NextResponse.json(settings);
}
