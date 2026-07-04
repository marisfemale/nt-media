import { z } from "zod"

function isSafeLocalGalleryImagePath(value: string) {
  return (
    value.startsWith("/uploads/gallery/") &&
    !value.includes("..") &&
    !value.includes("\\")
  )
}

export const galleryImageUrlSchema = z.string().refine(
  (value) => z.string().url().safeParse(value).success || isSafeLocalGalleryImagePath(value),
  "Image must be a valid URL or a local gallery upload path"
)
