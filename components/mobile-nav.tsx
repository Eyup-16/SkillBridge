"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SkillBridgeLogo from "./skillbridge-logo";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/services",
      label: "Services",
      active: pathname === "/services",
    },
    {
      href: "/workers",
      label: "Workers",
      active: pathname === "/workers",
    },
    {
      href: "/forum",
      label: "Community",
      active: pathname === "/forum" || pathname.startsWith("/forum/"),
    },
    {
      href: "/about",
      label: "About",
      active: pathname === "/about",
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <div className="px-2 py-4">
          <Link href="/" onClick={() => setOpen(false)}>
            <SkillBridgeLogo />
          </Link>
        </div>
        <nav className="flex flex-col gap-4 px-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center py-2 text-base font-medium transition-colors hover:text-primary",
                route.active
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-2 py-4">
          <div className="flex flex-col gap-2">
            <Link 
              href="/sign-in" 
              onClick={() => setOpen(false)}
              className="w-full"
            >
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link 
              href="/sign-up" 
              onClick={() => setOpen(false)}
              className="w-full"
            >
              <Button className="w-full">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
