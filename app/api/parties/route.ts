import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { buildSchedule } from "@/lib/distribution";
import { presetPercentages } from "@/lib/settings";
import { Party } from "@/models/Party";
import { Settings } from "@/models/Settings";

export async function GET() {
  await connectDb();
  const parties = await Party.find().sort({ createdAt: -1 });
  return NextResponse.json(parties);
}

export async function POST(req: NextRequest) {
  await connectDb();
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const totalDue = Number(body.totalDue ?? 0);

  if (!name || !Number.isFinite(totalDue) || totalDue <= 0) {
    return NextResponse.json({ error: "name and totalDue are required" }, { status: 400 });
  }

  const settings = (await Settings.findOne()) ??
    (await Settings.create({ weekPercentages: presetPercentages("equal"), preset: "equal" }));

  const schedule = buildSchedule(totalDue, settings.weekPercentages);

  const party = await Party.create({
    name,
    totalDue,
    balance: totalDue,
    schedule,
    paymentHistory: []
  });

  return NextResponse.json(party, { status: 201 });
}
