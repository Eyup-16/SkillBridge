"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ServiceList } from "@/components/dashboard/services/service-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ServicesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/sign-in");
          return;
        }

        // Get user's profile with selected role
        const { data: profile } = await supabase
          .from("profiles")
          .select("selected_role")
          .eq("id", user.id)
          .single();

        if (!profile || profile.selected_role !== "worker") {
          toast({
            title: "Access Denied",
            description: "You need to be in worker role to access this page.",
            variant: "destructive",
          });
          router.push("/dashboard");
          return;
        }

        setSelectedRole(profile.selected_role);

        // Fetch service categories
        const { data: categoriesData } = await supabase
          .from("service_categories")
          .select("*")
          .order("name");

        setCategories(categoriesData || []);

        // Fetch worker services
        const { data: servicesData, error } = await supabase
          .from("worker_services")
          .select(`
            *,
            service_categories(id, name, icon),
            service_images(id, image_url, is_primary)
          `)
          .eq("worker_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setServices(servicesData || []);
        setFilteredServices(servicesData || []);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast({
          title: "Error",
          description: "Failed to load services. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [supabase, router, toast]);

  // Filter and sort services when search query, category, or sort order changes
  useEffect(() => {
    let filtered = [...services];

    // Filter by category
    if (selectedCategory !== null) {
      filtered = filtered.filter((service) => service.category_id === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((service) => {
        const title = service.title.toLowerCase();
        const description = service.description.toLowerCase();
        const category = service.service_categories?.name.toLowerCase() || "";

        return (
          title.includes(query) ||
          description.includes(query) ||
          category.includes(query)
        );
      });
    }

    // Sort services
    if (sortOrder === "newest") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOrder === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortOrder === "price-high") {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortOrder === "price-low") {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOrder === "title-az") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === "title-za") {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    }

    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, sortOrder, services]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleSortChange = (order: string) => {
    setSortOrder(order);
  };

  if (isLoading) {
    return <DashboardLoading title="Loading services..." />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="My Services"
        description="Manage the services you offer"
        actions={
          <Button asChild>
            <Link href="/dashboard/services/create">
              <Plus className="mr-2 h-4 w-4" />
              Add New Service
            </Link>
          </Button>
        }
      />

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search services..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start">
                <Filter className="mr-2 h-4 w-4" />
                {selectedCategory !== null
                  ? categories.find(c => c.id === selectedCategory)?.name || "Category"
                  : "All Categories"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleCategoryChange(null)}>
                All Categories
              </DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start">
                <Filter className="mr-2 h-4 w-4" />
                {sortOrder === "newest"
                  ? "Newest First"
                  : sortOrder === "oldest"
                  ? "Oldest First"
                  : sortOrder === "price-high"
                  ? "Price: High to Low"
                  : sortOrder === "price-low"
                  ? "Price: Low to High"
                  : sortOrder === "title-az"
                  ? "Title: A to Z"
                  : "Title: Z to A"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSortChange("newest")}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("oldest")}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("price-high")}>
                Price: High to Low
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("price-low")}>
                Price: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("title-az")}>
                Title: A to Z
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("title-za")}>
                Title: Z to A
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Services List */}
      <ServiceList
        services={filteredServices}
        isLoading={isLoading}
      />
    </div>
  );
}
