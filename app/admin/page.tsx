import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Images, Calendar, Users, Eye } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch counts
  const [galleriesResult, bookingsResult, accessRequestsResult] = await Promise.all([
    supabase.from("galleries").select("id", { count: "exact", head: true }),
    supabase.from("bookings").select("id", { count: "exact", head: true }),
    supabase.from("gallery_access_requests").select("id", { count: "exact", head: true }).eq("is_approved", false),
  ])

  const stats = [
    {
      title: "Total Galleries",
      value: galleriesResult.count || 0,
      icon: Images,
      href: "/admin/galleries",
    },
    {
      title: "Total Bookings",
      value: bookingsResult.count || 0,
      icon: Calendar,
      href: "/admin/bookings",
    },
    {
      title: "Pending Access Requests",
      value: accessRequestsResult.count || 0,
      icon: Eye,
      href: "/admin/galleries",
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to NT Media Admin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
