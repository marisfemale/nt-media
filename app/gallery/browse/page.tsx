import { prisma } from "@/lib/db"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Calendar, User, Eye, Images } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function BrowseGalleriesPage() {
  // Fetch only public galleries
  const galleries = await prisma.gallery.findMany({
    where: { is_public: true },
    include: {
      _count: {
        select: { photos: true },
      },
    },
    orderBy: { created_at: "desc" },
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to gallery access
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Images className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Public Galleries
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto leading-6">
            Browse our featured client galleries. To view all photos, you can request access or use your private code.
          </p>
        </div>

        {galleries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((gallery) => (
              <Link key={gallery.id} href={`/gallery/${gallery.access_code}`} className="block h-full">
                <Card className="overflow-hidden hover:border-accent/50 transition-colors group h-full">
                  <div className="relative aspect-video bg-secondary">
                    {gallery.cover_image_url ? (
                      <Image
                        src={gallery.cover_image_url || "/placeholder.svg"}
                        alt={gallery.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <Images className="w-12 h-12 opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-semibold text-foreground text-lg line-clamp-1">
                        {gallery.title}
                      </h3>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    {gallery.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-6">
                        {gallery.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {gallery.client_name}
                      </div>
                      {gallery.shoot_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(gallery.shoot_date).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {gallery._count.photos} photos
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-8 sm:p-12 text-center">
            <Images className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-serif font-bold text-foreground">
              No public galleries yet
            </h2>
            <p className="mx-auto max-w-md text-muted-foreground leading-6">
              Public galleries will appear here after they are published from the admin area.
            </p>
            <Link
              href="/gallery"
              className="text-accent hover:underline mt-4 inline-block"
            >
              Have an access code? Enter it here
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
