import { Card, CardContent } from "@/components/ui/card"
import { Users, Globe, Star, Clock } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "10K+",
    label: "Active Learners",
    color: "present",
  },
  {
    icon: Globe,
    value: "6",
    label: "Languages Supported",
    color: "past",
  },
  {
    icon: Star,
    value: "4.9",
    label: "User Rating",
    color: "future",
  },
  {
    icon: Clock,
    value: "5min",
    label: "Daily Practice",
    color: "present",
  },
]

export function StatsSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center border-2 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-4 ${
                    stat.color === "past"
                      ? "bg-past-light"
                      : stat.color === "present"
                        ? "bg-present-light"
                        : "bg-future-light"
                  }`}
                >
                  <stat.icon
                    className={`h-6 w-6 ${
                      stat.color === "past" ? "text-past" : stat.color === "present" ? "text-present" : "text-future"
                    }`}
                  />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
