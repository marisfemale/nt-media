import { readFile } from "node:fs/promises"
import path from "node:path"

import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { createZip, type ZipEntry } from "@/lib/zip"

export const runtime = "nodejs"

const imageExtensions = new Set(["avif", "gif", "heic", "heif", "jpeg", "jpg", "png", "tif", "tiff", "webp"])

function sanitizeFilename(value: string, fallback: string) {
  const sanitized = value
    .trim()
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)

  return sanitized || fallback
}

function getExtensionFromContentType(contentType: string | null) {
  const type = contentType?.split(";")[0]?.trim().toLowerCase()

  switch (type) {
    case "image/avif":
      return "avif"
    case "image/gif":
      return "gif"
    case "image/heic":
      return "heic"
    case "image/heif":
      return "heif"
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/tiff":
      return "tif"
    case "image/webp":
      return "webp"
    default:
      return null
  }
}

function getExtensionFromUrl(imageUrl: string) {
  try {
    const pathname = imageUrl.startsWith("/") ? imageUrl : new URL(imageUrl).pathname
    const extension = path.extname(pathname).replace(".", "").toLowerCase()

    return imageExtensions.has(extension) ? extension : "jpg"
  } catch {
    return "jpg"
  }
}

function getLocalPublicPath(imageUrl: string) {
  const publicRoot = path.join(process.cwd(), "public")
  const absolutePath = path.resolve(publicRoot, imageUrl.slice(1))
  const relativePath = path.relative(publicRoot, absolutePath)

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Invalid local image path")
  }

  return absolutePath
}

async function readPhoto(imageUrl: string) {
  if (imageUrl.startsWith("/")) {
    return {
      data: await readFile(getLocalPublicPath(imageUrl)),
      extension: getExtensionFromUrl(imageUrl),
    }
  }

  const remoteUrl = new URL(imageUrl)

  if (remoteUrl.protocol !== "http:" && remoteUrl.protocol !== "https:") {
    throw new Error("Unsupported remote image URL")
  }

  const response = await fetch(remoteUrl)

  if (!response.ok) {
    throw new Error(`Unable to fetch image: ${response.status}`)
  }

  return {
    data: Buffer.from(await response.arrayBuffer()),
    extension: getExtensionFromContentType(response.headers.get("content-type")) ?? getExtensionFromUrl(imageUrl),
  }
}

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
    orderBy: [{ sort_order: "asc" }, { created_at: "asc" }],
    select: {
      id: true,
      image_url: true,
      title: true,
      created_at: true,
    },
  })

  if (photos.length === 0) {
    return NextResponse.json({ error: "No photos available to download" }, { status: 404 })
  }

  try {
    const entries: ZipEntry[] = await Promise.all(
      photos.map(async (photo, index) => {
        const photoFile = await readPhoto(photo.image_url)
        const baseName = sanitizeFilename(photo.title || `photo-${index + 1}`, `photo-${index + 1}`)
        const fileName = `${String(index + 1).padStart(3, "0")}-${baseName}.${photoFile.extension}`

        return {
          name: fileName,
          data: photoFile.data,
          modifiedAt: photo.created_at,
        }
      })
    )

    const zip = createZip(entries)
    const zipFileName = `${sanitizeFilename(gallery.title, "gallery")}-${gallery.access_code}.zip`

    return new NextResponse(zip, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${zipFileName}"`,
        "Content-Length": zip.byteLength.toString(),
        "Content-Type": "application/zip",
      },
    })
  } catch (error) {
    console.error("Unable to prepare gallery download", error)
    return NextResponse.json({ error: "Unable to prepare gallery download" }, { status: 502 })
  }
}
