"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Filter,
  ChevronRight,
  Search,
  Hammer,
  Droplet,
  Zap,
  Scissors,
  Wrench,
  Paintbrush,
  Trash,
  Flower,
  BookOpen,
  Cpu,
  X,
  Check,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Map category names to icons
const categoryIcons: Record<string, any> = {
  "Carpentry": Hammer,
  "Plumbing": Droplet,
  "Electrical": Zap,
  "Tailoring": Scissors,
  "Mechanics": Wrench,
  "Painting": Paintbrush,
  "Cleaning": Trash,
  "Gardening": Flower,
  "Teaching": BookOpen,
  "Technology": Cpu,
};

interface CategoryFilterProps {
  showSearch?: boolean;
  showLocation?: boolean;
  className?: string;
}

export function CategoryFilter({ 
  showSearch = true, 
  showLocation = true,
  className 
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [locationValue, setLocationValue] = useState("");
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get current search params
  const currentCategory = searchParams.get("category");
  const currentSearch = searchParams.get("search");
  const currentLocation = searchParams.get("location");
  
  // Set initial form values from URL
  useEffect(() => {
    setSearchValue(currentSearch || "");
    setLocationValue(currentLocation || "");
  }, [currentSearch, currentLocation]);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from("service_categories")
          .select("*")
          .eq("is_active", true)
          .order("name");
        
        if (error) {
          throw error;
        }
        
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new URLSearchParams
    const params = new URLSearchParams(searchParams);
    
    // Update search params
    if (searchValue) {
      params.set("search", searchValue);
    } else {
      params.delete("search");
    }
    
    if (locationValue) {
      params.set("location", locationValue);
    } else {
      params.delete("location");
    }
    
    // Navigate to the same page with updated params
    router.push(`${pathname}?${params.toString()}`);
  };
  
  // Get icon for a category
  const getCategoryIcon = (categoryName: string) => {
    const IconComponent = categoryIcons[categoryName] || Filter;
    return <IconComponent className="h-4 w-4 mr-2" />;
  };
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and location filters */}
      {(showSearch || showLocation) && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {showSearch && (
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search services..."
                  className="pl-10"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {showLocation && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <Filter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="City or country..."
                  className="pl-10"
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <Button type="submit" className="w-full">
            Apply Filters
          </Button>
        </form>
      )}
      
      {/* Categories list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium">Categories</Label>
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
            <Link href={pathname}>
              Clear
            </Link>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-1 max-h-[320px] overflow-y-auto pr-2">
            <Link
              href={pathname}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                !currentCategory
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <span className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                All Categories
              </span>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </Link>
            
            {categories.map((category) => {
              // Create URL with this category
              const params = new URLSearchParams(searchParams);
              params.set("category", category.name.toLowerCase());
              const categoryUrl = `${pathname}?${params.toString()}`;
              
              const isActive = 
                currentCategory?.toLowerCase() === category.name.toLowerCase();
              
              return (
                <Link
                  key={category.id}
                  href={categoryUrl}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <span className="flex items-center">
                    {getCategoryIcon(category.name)}
                    {category.name}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Active filters */}
      {(currentCategory || currentSearch || currentLocation) && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Active Filters</Label>
          <div className="flex flex-wrap gap-2">
            {currentCategory && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {currentCategory}
                <Link href={pathname + "?" + new URLSearchParams(
                  Object.fromEntries(
                    Array.from(searchParams.entries()).filter(([key]) => key !== "category")
                  )
                ).toString()}>
                  <X className="h-3 w-3 ml-1" />
                </Link>
              </Badge>
            )}
            
            {currentSearch && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {currentSearch}
                <Link href={pathname + "?" + new URLSearchParams(
                  Object.fromEntries(
                    Array.from(searchParams.entries()).filter(([key]) => key !== "search")
                  )
                ).toString()}>
                  <X className="h-3 w-3 ml-1" />
                </Link>
              </Badge>
            )}
            
            {currentLocation && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Location: {currentLocation}
                <Link href={pathname + "?" + new URLSearchParams(
                  Object.fromEntries(
                    Array.from(searchParams.entries()).filter(([key]) => key !== "location")
                  )
                ).toString()}>
                  <X className="h-3 w-3 ml-1" />
                </Link>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
