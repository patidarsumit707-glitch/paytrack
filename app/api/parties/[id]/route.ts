import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { buildSchedule } from "@/lib/distribution";
import { Party } from "@/models/Party";
import { Settings } from "@/models/Settings";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDb();
  const body = await req.json();
  const party = await Party.findById(params.id);
  if (!party) return NextResponse.json({ error: "Party not found" }, { status: 404 });

  const nextName = String(body.name ?? party.name).trim();
  const nextTotalDue = Number(body.totalDue ?? party.totalDue);

  if (!nextName || !Number.isFinite(nextTotalDue) || nextTotalDue <= 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  party.name = nextName;

  if (nextTotalDue !== party.totalDue) {
    const paidAmount = party.schedule
      .filter((week) => week.status === "paid")
      .reduce((acc, week) => acc + week.amount, 0);
    const remaining = Math.max(0, Number((nextTotalDue - paidAmount).toFixed(2)));
    const settings = await Settings.findOne();
    party.schedule = buildSchedule(remaining, settings?.weekPercentages ?? new Array(13).fill(100 / 13));
    party.balance = remaining;
    party.totalDue = nextTotalDue;
  }

  await party.save();
  return NextResponse.json(party);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDb();
  await Party.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
