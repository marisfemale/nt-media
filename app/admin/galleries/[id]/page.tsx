"use client"

import React from "react"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Upload,
  X,
  ImageIcon,
  Star,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Gallery {
  id: string
  title: string
  description: string | null
  client_name: string
  client_email: string
  shoot_date: string | null
  access_code: string
  is_public: boolean
  cover_image_url: string | null
}

interface Photo {
  id: string
  gallery_id: string
  image_url: string
  thumbnail_url: string | null
  title: string | null
  is_public: boolean
  sort_order: number
}

export default function GalleryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const galleryId = params.id as string

  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [newPhotoUrl, setNewPhotoUrl] = useState("")
  const [isAddingPhoto, setIsAddingPhoto] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<Gallery | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isDragging, setIsDragging] = useState(false)

  const supabase = createClient()

  const fetchGallery = useCallback(async () => {
    const { data: galleryData } = await supabase
      .from("galleries")
      .select("*")
      .eq("id", galleryId)
      .single()

    const { data: photosData } = await supabase
      .from("gallery_photos")
      .select("*")
      .eq("gallery_id", galleryId)
      .order("sort_order", { ascending: true })

    if (galleryData) {
      setGallery(galleryData)
      setFormData(galleryData)
    }
    if (photosData) {
      setPhotos(photosData)
    }
    setIsLoading(false)
  }, [galleryId, supabase])

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  const handleSave = async () => {
    if (!formData) return
    setIsSaving(true)

    const { error } = await supabase
      .from("galleries")
      .update({
        title: formData.title,
        description: formData.description,
        client_name: formData.client_name,
        client_email: formData.client_email,
        shoot_date: formData.shoot_date,
        is_public: formData.is_public,
        access_code: formData.access_code,
      })
      .eq("id", galleryId)

    setIsSaving(false)

    if (error) {
      alert("Error saving gallery")
      return
    }

    setGallery(formData)
    setEditMode(false)
  }

  const handleAddPhoto = async () => {
    if (!newPhotoUrl) return
    setIsAddingPhoto(true)

    const { data, error } = await supabase
      .from("gallery_photos")
      .insert({
        gallery_id: galleryId,
        image_url: newPhotoUrl,
        is_public: false,
        sort_order: photos.length,
      })
      .select()
      .single()

    setIsAddingPhoto(false)

    if (error) {
      alert("Error adding photo")
      return
    }

    setPhotos([...photos, data])
    setNewPhotoUrl("")

    // Set as cover if first photo
    if (photos.length === 0) {
      await supabase
        .from("galleries")
        .update({ cover_image_url: newPhotoUrl })
        .eq("id", galleryId)
      if (gallery) {
        setGallery({ ...gallery, cover_image_url: newPhotoUrl })
      }
    }
  }

  // File upload handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      setUploadingFiles((prev) => [...prev, ...fileArray])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files) {
      const fileArray = Array.from(files).filter((file) =>
        ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)
      )
      setUploadingFiles((prev) => [...prev, ...fileArray])
    }
  }

  const removeFileFromQueue = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (uploadingFiles.length === 0) return

    setIsAddingPhoto(true)
    const newPhotos: Photo[] = []

    for (let i = 0; i < uploadingFiles.length; i++) {
      const file = uploadingFiles[i]
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))

      try {
        // Upload to Vercel Blob
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const { url } = await response.json()
        setUploadProgress((prev) => ({ ...prev, [file.name]: 50 }))

        // Add to database
        const { data, error } = await supabase
          .from("gallery_photos")
          .insert({
            gallery_id: galleryId,
            image_url: url,
            is_public: false,
            sort_order: photos.length + i,
          })
          .select()
          .single()

        if (error) throw error

        newPhotos.push(data)
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))

        // Set as cover if first photo
        if (photos.length === 0 && i === 0) {
          await supabase
            .from("galleries")
            .update({ cover_image_url: url })
            .eq("id", galleryId)
          if (gallery) {
            setGallery({ ...gallery, cover_image_url: url })
          }
        }
      } catch (error) {
        console.error("Error uploading file:", file.name, error)
        setUploadProgress((prev) => ({ ...prev, [file.name]: -1 }))
      }
    }

    setPhotos((prev) => [...prev, ...newPhotos])
    setUploadingFiles([])
    setUploadProgress({})
    setIsAddingPhoto(false)
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Delete this photo?")) return

    const { error } = await supabase
      .from("gallery_photos")
      .delete()
      .eq("id", photoId)

    if (!error) {
      setPhotos(photos.filter((p) => p.id !== photoId))
    }
  }

  const handleTogglePhotoPublic = async (photoId: string, isPublic: boolean) => {
    const { error } = await supabase
      .from("gallery_photos")
      .update({ is_public: !isPublic })
      .eq("id", photoId)

    if (!error) {
      setPhotos(
        photos.map((p) =>
          p.id === photoId ? { ...p, is_public: !isPublic } : p
        )
      )
    }
  }

  const handleSetCover = async (imageUrl: string) => {
    const { error } = await supabase
      .from("galleries")
      .update({ cover_image_url: imageUrl })
      .eq("id", galleryId)

    if (!error && gallery) {
      setGallery({ ...gallery, cover_image_url: imageUrl })
    }
  }

  const handleDeleteGallery = async () => {
    if (!confirm("Are you sure you want to delete this gallery? This cannot be undone.")) return

    const { error } = await supabase
      .from("galleries")
      .delete()
      .eq("id", galleryId)

    if (!error) {
      router.push("/admin/galleries")
    }
  }

  const copyAccessCode = () => {
    if (gallery) {
      navigator.clipboard.writeText(gallery.access_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!gallery) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Gallery not found</p>
        <Link href="/admin/galleries" className="text-accent hover:underline mt-2 inline-block">
          Back to galleries
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8">
      <Link
        href="/admin/galleries"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to galleries
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">{gallery.title}</h1>
          <p className="text-muted-foreground mt-1">{gallery.client_name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/gallery/${gallery.access_code}`}
            target="_blank"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-4 h-4" />
            View Gallery
          </Link>
          <Button
            variant="outline"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Cancel" : "Edit Details"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteGallery}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gallery Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gallery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode && formData ? (
                <>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Name</Label>
                    <Input
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Email</Label>
                    <Input
                      value={formData.client_email}
                      onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Public Gallery</Label>
                    <Switch
                      checked={formData.is_public}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                    />
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={gallery.is_public ? "default" : "secondary"}>
                      {gallery.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Photos</span>
                    <span className="text-foreground">{photos.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Public Photos</span>
                    <span className="text-foreground">
                      {photos.filter((p) => p.is_public).length}
                    </span>
                  </div>
                  {gallery.shoot_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Shoot Date</span>
                      <span className="text-foreground">
                        {new Date(gallery.shoot_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Access Code Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Access Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-secondary px-4 py-3 rounded-lg font-mono text-lg text-center">
                  {gallery.access_code}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyAccessCode}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Share this code with {gallery.client_name} to give them full access to the gallery.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Photos Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Photos</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Photos
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Photos</DialogTitle>
                    <DialogDescription>
                      Upload photos from your computer or add by URL.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    {/* File Upload Area */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                        isDragging
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-foreground font-medium mb-1">
                        Drag and drop photos here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse (JPEG, PNG, WebP, GIF - max 10MB each)
                      </p>
                    </div>

                    {/* Upload Queue */}
                    {uploadingFiles.length > 0 && (
                      <div className="space-y-3">
                        <Label>Selected Photos ({uploadingFiles.length})</Label>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {uploadingFiles.map((file, index) => (
                            <div
                              key={`${file.name}-${index}`}
                              className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                            >
                              <div className="w-12 h-12 rounded bg-background flex items-center justify-center overflow-hidden">
                                <Image
                                  src={URL.createObjectURL(file) || "/placeholder.svg"}
                                  alt={file.name}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                {uploadProgress[file.name] !== undefined && (
                                  <div className="mt-1 h-1 bg-background rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all ${
                                        uploadProgress[file.name] === -1
                                          ? "bg-destructive"
                                          : "bg-accent"
                                      }`}
                                      style={{
                                        width: `${Math.max(0, uploadProgress[file.name])}%`,
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                              {!isAddingPhoto && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeFileFromQueue(index)}
                                  className="shrink-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={uploadFiles}
                          disabled={isAddingPhoto}
                          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                          {isAddingPhoto ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload {uploadingFiles.length} Photo{uploadingFiles.length > 1 ? "s" : ""}
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or add by URL</span>
                      </div>
                    </div>

                    {/* URL Input */}
                    <div className="space-y-2">
                      <Label>Photo URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newPhotoUrl}
                          onChange={(e) => setNewPhotoUrl(e.target.value)}
                          placeholder="https://example.com/photo.jpg"
                          className="bg-input border-border"
                        />
                        <Button
                          onClick={handleAddPhoto}
                          disabled={!newPhotoUrl || isAddingPhoto}
                          className="bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                          {isAddingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square rounded-lg overflow-hidden group bg-secondary"
                    >
                      <Image
                        src={photo.image_url || "/placeholder.svg"}
                        alt={photo.title || "Gallery photo"}
                        fill
                        className="object-cover"
                      />
                      {/* Overlay with actions */}
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => handleTogglePhotoPublic(photo.id, photo.is_public)}
                          title={photo.is_public ? "Make private" : "Make public"}
                        >
                          {photo.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => handleSetCover(photo.image_url)}
                          title="Set as cover"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDeletePhoto(photo.id)}
                          title="Delete photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {/* Status badges */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {photo.is_public && (
                          <Badge variant="default" className="text-xs">Public</Badge>
                        )}
                        {gallery.cover_image_url === photo.image_url && (
                          <Badge variant="secondary" className="text-xs">Cover</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No photos yet. Click "Add Photos" to upload images.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
