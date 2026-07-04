import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Eye, Images, MessageSquare } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  // Fetch counts
  const [galleriesCount, bookingsCount, inquiriesCount, accessRequestsCount] = await Promise.all([
    prisma.gallery.count(),
    prisma.booking.count(),
    prisma.contactInquiry.count({ where: { status: "new" } }),
    prisma.galleryAccessRequest.count({ where: { is_approved: false } }),
  ])

  const stats = [
    {
      title: "Total Galleries",
      value: galleriesCount,
      icon: Images,
      href: "/admin/galleries",
    },
    {
      title: "Total Bookings",
      value: bookingsCount,
      icon: Calendar,
      href: "/admin/bookings",
    },
    {
      title: "New Inquiries",
      value: inquiriesCount,
      icon: MessageSquare,
      href: "/admin/inquiries",
    },
    {
      title: "Pending Access Requests",
      value: accessRequestsCount,
      icon: Eye,
      href: "/admin/galleries",
    },
  ]

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to NT Media Admin</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:border-accent/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
