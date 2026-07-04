import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const accessToken = request.nextUrl.searchParams.get("token")
  const gallery = await prisma.gallery.findUnique({
    where: { access_code: code.toUpperCase() },
  })

  if (!gallery) {
    return NextResponse.json({ error: "Gallery not found" }, { status: 404 })
  }

  let hasFullAccess = true

  if (accessToken) {
    const tokenData = await prisma.galleryAccessRequest.findFirst({
      where: {
        access_token: accessToken,
        gallery_id: gallery.id,
        is_approved: true,
        OR: [{ token_expires_at: null }, { token_expires_at: { gt: new Date() } }],
      },
    })

    hasFullAccess = !!tokenData
  }

  const photos = await prisma.galleryPhoto.findMany({
    where: {
      gallery_id: gallery.id,
      ...(hasFullAccess ? {} : { is_public: true }),
    },
    orderBy: { sort_order: "asc" },
    select: {
      id: true,
      image_url: true,
      title: true,
      is_public: true,
    },
  })

  return NextResponse.json({ gallery, photos, hasFullAccess })
}
