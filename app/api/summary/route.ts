import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Party } from "@/models/Party";

export async function GET() {
  await connectDb();
  const parties = await Party.find();

  const summary = parties.reduce(
    (acc, party) => {
      const pending = party.schedule.filter((week) => week.status === "pending");
      acc.currentWeek += pending[0]?.amount ?? 0;
      acc.nextWeek += pending[1]?.amount ?? 0;
      acc.weekPlus2 += pending[2]?.amount ?? 0;
      acc.totalOutstanding += party.balance;
      return acc;
    },
    { currentWeek: 0, nextWeek: 0, weekPlus2: 0, totalOutstanding: 0 }
  );

  return NextResponse.json(
    Object.fromEntries(Object.entries(summary).map(([k, v]) => [k, Number(v.toFixed(2))]))
  );
}
