"use client"

import React from "react"

import { useEffect, useState, useCallback } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
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
  Lock,
  Eye,
  Calendar,
  User,
  Mail,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
} from "lucide-react"

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
  image_url: string
  title: string | null
  is_public: boolean
}

export default function GalleryViewPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const code = params.code as string
  const accessToken = searchParams.get("token")

  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasFullAccess, setHasFullAccess] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestForm, setRequestForm] = useState({
    name: "",
    email: "",
    reason: "",
  })

  const fetchGallery = useCallback(async () => {
    const query = accessToken ? `?token=${encodeURIComponent(accessToken)}` : ""
    const response = await fetch(`/api/gallery/${code}${query}`)

    if (!response.ok) {
      setNotFound(true)
      setIsLoading(false)
      return
    }

    const {
      gallery: galleryData,
      photos: photosData,
      hasFullAccess: fullAccess,
    } = await response.json()

    setGallery(galleryData)
    setHasFullAccess(fullAccess)
    setPhotos(photosData || [])
    setIsLoading(false)
  }, [code, accessToken])

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gallery) return
    setIsSubmitting(true)

    // Generate unique token
    const token = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 15)}`
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Token valid for 7 days

    const response = await fetch(`/api/gallery/${code}/access-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gallery_id: gallery.id,
        requester_name: requestForm.name,
        requester_email: requestForm.email,
        reason: requestForm.reason || null,
        access_token: token,
        token_expires_at: expiresAt.toISOString(),
        is_approved: true, // Auto-approve for demo purposes
      }),
    })

    setIsSubmitting(false)

    if (!response.ok) {
      alert("Error submitting request. Please try again.")
      return
    }

    setRequestSubmitted(true)
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  const nextPhoto = () => {
    if (lightboxIndex !== null && lightboxIndex < photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1)
    }
  }

  const prevPhoto = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Gallery Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The access code you entered doesn&apos;t match any gallery. Please check the code and try again.
            </p>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/gallery">Try Again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!gallery) return null

  const visiblePhotos = photos
  const privatePhotosCount = hasFullAccess ? 0 : photos.filter(p => !p.is_public).length
  const downloadAllHref = `/api/gallery/${encodeURIComponent(code)}/download${
    accessToken ? `?token=${encodeURIComponent(accessToken)}` : ""
  }`

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-3">
            {hasFullAccess ? (
              <Badge variant="default" className="gap-1">
                <Eye className="w-3 h-3" />
                Full Access
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Lock className="w-3 h-3" />
                Limited View
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Gallery Info */}
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                {gallery.title}
              </h1>
              {gallery.description && (
                <p className="text-muted-foreground text-lg mb-6 max-w-2xl">
                  {gallery.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {gallery.client_name}
                </div>
                {gallery.shoot_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(gallery.shoot_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {visiblePhotos.length} photos
                </div>
              </div>
            </div>

            {visiblePhotos.length > 0 && (
              <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto">
                <a href={downloadAllHref}>
                  <Download className="w-4 h-4" />
                  Download All
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="container mx-auto px-6 py-12">
        {visiblePhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visiblePhotos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => openLightbox(index)}
                className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
              >
                <Image
                  src={photo.image_url || "/placeholder.svg"}
                  alt={photo.title || "Gallery photo"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-8 h-8 text-foreground" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No photos available</p>
          </div>
        )}

        {/* Request Access Banner */}
        {!hasFullAccess && (
          <Card className="mt-12 border-accent/30 bg-accent/5">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Want to see the full gallery?
                  </h3>
                  <p className="text-muted-foreground">
                    {privatePhotosCount > 0
                      ? `There are more photos available. Request access to view all ${photos.length + privatePhotosCount} photos.`
                      : "Request access to view all photos in high resolution."}
                  </p>
                </div>
                <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                      <Mail className="w-4 h-4 mr-2" />
                      Request Access
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    {requestSubmitted ? (
                      <div className="text-center py-6">
                        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-8 h-8 text-accent" />
                        </div>
                        <DialogTitle className="mb-2">Request Submitted!</DialogTitle>
                        <DialogDescription className="mb-4">
                          We&apos;ve sent an access link to your email address. Please check your inbox to view the full gallery.
                        </DialogDescription>
                        <Button
                          onClick={() => {
                            setRequestDialogOpen(false)
                            setRequestSubmitted(false)
                          }}
                          className="bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                          Done
                        </Button>
                      </div>
                    ) : (
                      <>
                        <DialogHeader>
                          <DialogTitle>Request Gallery Access</DialogTitle>
                          <DialogDescription>
                            Fill in your details and we&apos;ll send you a private link to view the full gallery.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleRequestAccess} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="reqName">Your Name *</Label>
                            <Input
                              id="reqName"
                              value={requestForm.name}
                              onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                              required
                              className="bg-input border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reqEmail">Your Email *</Label>
                            <Input
                              id="reqEmail"
                              type="email"
                              value={requestForm.email}
                              onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                              required
                              className="bg-input border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reqReason">Why would you like access?</Label>
                            <Textarea
                              id="reqReason"
                              value={requestForm.reason}
                              onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                              placeholder="e.g., I was a guest at this event..."
                              className="bg-input border-border"
                            />
                          </div>
                          <Button
                            type="submit"
                            disabled={isSubmitting || !requestForm.name || !requestForm.email}
                            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Submit Request"
                            )}
                          </Button>
                        </form>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={prevPhoto}
              className="absolute left-4 p-2 text-muted-foreground hover:text-foreground z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {lightboxIndex < photos.length - 1 && (
            <button
              onClick={nextPhoto}
              className="absolute right-4 p-2 text-muted-foreground hover:text-foreground z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          <div className="relative w-full h-full max-w-6xl max-h-[90vh] m-4">
            <Image
              src={visiblePhotos[lightboxIndex].image_url || "/placeholder.svg"}
              alt={visiblePhotos[lightboxIndex].title || "Gallery photo"}
              fill
              className="object-contain"
            />
          </div>

          {hasFullAccess && (
            <a
              href={visiblePhotos[lightboxIndex].image_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:bg-accent/90"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
            {lightboxIndex + 1} / {visiblePhotos.length}
          </div>
        </div>
      )}
    </div>
  )
}
