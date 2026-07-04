import { prisma } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, EyeOff, Calendar, User } from "lucide-react"
import Image from "next/image"

export const dynamic = "force-dynamic"

export default async function GalleriesPage() {
  const galleries = await prisma.gallery.findMany({
    include: {
      _count: {
        select: { photos: true },
      },
    },
    orderBy: { created_at: "desc" },
  })

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Galleries</h1>
          <p className="text-muted-foreground mt-1">Manage client photo galleries</p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/admin/galleries/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Gallery
          </Link>
        </Button>
      </div>

      {galleries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => (
            <Link key={gallery.id} href={`/admin/galleries/${gallery.id}`}>
              <Card className="overflow-hidden hover:border-accent/50 transition-colors cursor-pointer group">
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
                      No cover image
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={gallery.is_public ? "default" : "secondary"} className="gap-1">
                      {gallery.is_public ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {gallery.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                    {gallery.title}
                  </h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      {gallery.client_name}
                    </div>
                    {gallery.shoot_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(gallery.shoot_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>{gallery._count.photos} photos</span>
                    <span className="font-mono">{gallery.access_code}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="text-muted-foreground mb-4">No galleries yet</div>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/admin/galleries/new">
              <Plus className="w-4 h-4 mr-2" />
              Create your first gallery
            </Link>
          </Button>
        </Card>
      )}
    </div>
  )
}
