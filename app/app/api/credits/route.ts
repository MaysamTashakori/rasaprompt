import { NextResponse } from "next/server"
import { creditStore, TIERS } from "@/lib/credits"
import { getUid } from "@/lib/uid"

const store = creditStore()

export async function GET() {
  const a = store.get(await getUid())
  return NextResponse.json({ free: a.freeLeft, paid: a.paid, tiers: TIERS.map(({ id, credits_per_1k, free, names, desc }) => ({ id, credits_per_1k, free, names, desc })) })
}
