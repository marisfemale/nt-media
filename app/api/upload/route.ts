import { put } from "@vercel/blob"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { type NextRequest, NextResponse } from "next/server"

import { requireAdminRequest } from "@/lib/admin-auth"

const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const maxSize = 10 * 1024 * 1024
const localUploadDirectory = path.join(process.cwd(), "public", "uploads", "gallery")

function getFileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase()

  if (extension && /^[a-z0-9]+$/.test(extension)) {
    return extension
  }

  return file.type.split("/").pop() || "jpg"
}

function createUploadFilename(file: File) {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const extension = getFileExtension(file)

  return `${timestamp}-${randomStr}.${extension}`
}

function hasConfiguredBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN

  return Boolean(token && token !== "vercel_blob_rw_your_token")
}

async function uploadToLocalPublicStorage(file: File) {
  await mkdir(localUploadDirectory, { recursive: true })

  const filename = createUploadFilename(file)
  const pathname = `uploads/gallery/${filename}`
  const bytes = Buffer.from(await file.arrayBuffer())

  await writeFile(path.join(localUploadDirectory, filename), bytes)

  return {
    url: `/${pathname}`,
    pathname,
  }
}

async function uploadToVercelBlob(file: File) {
  const filename = `gallery/${createUploadFilename(file)}`

  const blob = await put(filename, file, {
    access: "public",
  })

  return {
    url: blob.url,
    pathname: blob.pathname,
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      )
    }

    let uploadedFile: Awaited<ReturnType<typeof uploadToVercelBlob>>

    if (hasConfiguredBlobToken()) {
      try {
        uploadedFile = await uploadToVercelBlob(file)
      } catch (error) {
        if (process.env.NODE_ENV === "production") {
          throw error
        }

        console.warn("Vercel Blob upload failed. Falling back to local storage.", error)
        uploadedFile = await uploadToLocalPublicStorage(file)
      }
    } else {
      if (process.env.NODE_ENV === "production") {
        throw new Error("BLOB_READ_WRITE_TOKEN is not configured")
      }

      uploadedFile = await uploadToLocalPublicStorage(file)
    }

    return NextResponse.json({
      url: uploadedFile.url,
      pathname: uploadedFile.pathname,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
