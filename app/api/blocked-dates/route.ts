import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function GET() {
  const blockedDates = await prisma.blockedDate.findMany({
    orderBy: { blocked_date: "asc" },
    select: { blocked_date: true },
  })

  return NextResponse.json(blockedDates)
}
