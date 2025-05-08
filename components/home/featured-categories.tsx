import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Hammer,
  Droplet,
  Zap,
  Scissors,
  Paintbrush,
  Trash2,
  Flower2,
  ChevronRight,
  Users,
  Car
} from "lucide-react";

const categories = [
  {
    name: "Carpentry",
    description: "Woodworking and furniture services",
    icon: Hammer,
    href: "/services?category=carpentry",
    count: 124,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    name: "Plumbing",
    description: "Water system installation and repair",
    icon: Droplet,
    href: "/services?category=plumbing",
    count: 98,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  {
    name: "Electrical",
    description: "Electrical installation and repair",
    icon: Zap,
    href: "/services?category=electrical",
    count: 87,
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  },
  {
    name: "Tailoring",
    description: "Clothing alterations and custom designs",
    icon: Scissors,
    href: "/services?category=tailoring",
    count: 156,
    color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  },
  {
    name: "Mechanics",
    description: "Vehicle repair and maintenance",
    icon: Car,
    href: "/services?category=mechanics",
    count: 72,
    color: "bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300",
  },
  {
    name: "Painting",
    description: "Interior and exterior painting services",
    icon: Paintbrush,
    href: "/services?category=painting",
    count: 63,
    color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
  {
    name: "Cleaning",
    description: "Home and office cleaning services",
    icon: Trash2,
    href: "/services?category=cleaning",
    count: 105,
    color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  {
    name: "Gardening",
    description: "Landscaping and plant care",
    icon: Flower2,
    href: "/services?category=gardening",
    count: 58,
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
];

export function FeaturedCategories() {
  return (
    <div className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Browse Service Categories
            </h2>
            <p className="text-lg text-muted-foreground">
              Find skilled workers in various categories to help with your needs
            </p>
          </div>
          <Button asChild variant="outline" size="lg" className="min-w-[200px]">
            <Link href="/services" className="flex items-center justify-center gap-2">
              View All Services
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative flex flex-col rounded-xl border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`rounded-full ${category.color} p-3`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="font-normal">
                    {category.count}+ providers
                  </Badge>
                </div>

                <h3 className="text-lg font-medium mb-2">{category.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>

              <div className="mt-auto p-4 border-t bg-muted/20 flex items-center justify-between">
                <span className="text-sm font-medium">Explore</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-xl border bg-card/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">Can't find what you need?</h3>
              <p className="text-muted-foreground mb-6">
                SkillBridge connects you with a wide range of skilled professionals. If you don't see the service you're looking for, browse our complete directory or post a request in our community forum.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <Link href="/services">Browse All Services</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/forum/new">Post a Request</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-16 w-16 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
