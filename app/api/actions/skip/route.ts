import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { applySkipRedistribution } from "@/lib/distribution";
import { Party } from "@/models/Party";
import { Settings } from "@/models/Settings";

export async function POST(req: NextRequest) {
  await connectDb();
  const { partyId } = await req.json();
  const party = await Party.findById(partyId);

  if (!party) return NextResponse.json({ error: "Party not found" }, { status: 404 });

  const currentWeek = party.schedule.find((item) => item.status === "pending");
  if (!currentWeek) return NextResponse.json({ error: "No pending week" }, { status: 400 });

  const settings = await Settings.findOne();
  if (!settings) return NextResponse.json({ error: "Settings are missing" }, { status: 400 });

  party.schedule = applySkipRedistribution(party.schedule, currentWeek.weekIndex, settings.weekPercentages);
  party.paymentHistory.push({
    action: "skip",
    weekIndex: currentWeek.weekIndex,
    amount: currentWeek.amount,
    timestamp: new Date()
  });

  party.balance = Number(
    party.schedule
      .filter((week) => week.status === "pending")
      .reduce((acc, week) => acc + week.amount, 0)
      .toFixed(2)
  );

  await party.save();
  return NextResponse.json(party);
}
