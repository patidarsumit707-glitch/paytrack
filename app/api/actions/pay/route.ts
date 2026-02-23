import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Party } from "@/models/Party";

export async function POST(req: NextRequest) {
  await connectDb();
  const { partyId } = await req.json();
  const party = await Party.findById(partyId);

  if (!party) return NextResponse.json({ error: "Party not found" }, { status: 404 });

  const week = party.schedule.find((item) => item.status === "pending");
  if (!week) return NextResponse.json({ error: "No pending week" }, { status: 400 });

  week.status = "paid";
  week.paidAt = new Date();
  party.balance = Number(Math.max(0, party.balance - week.amount).toFixed(2));
  party.paymentHistory.push({
    action: "pay",
    weekIndex: week.weekIndex,
    amount: week.amount,
    timestamp: new Date()
  });

  await party.save();
  return NextResponse.json(party);
}
