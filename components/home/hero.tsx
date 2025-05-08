import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function HomeHero() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20 dark:bg-[radial-gradient(#ffffff33_1px,transparent_1px)]"></div>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-start text-left">
            <Badge variant="outline" className="mb-4 px-3 py-1 text-sm rounded-full">
              Community Skill-Sharing Platform
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              Connect with skilled workers in your community
            </h1>

            <p className="text-lg leading-8 text-muted-foreground mb-8">
              SkillBridge connects local skilled workers with customers in need of services.
              Find reliable carpenters, tailors, mechanics, and more in your area, or offer your skills to those who need them.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full">
              {[
                "Verified local professionals",
                "Secure booking system",
                "Community-driven ratings",
                "Low-bandwidth optimized"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/services">
                  Find Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/sign-up">Offer Your Skills</Link>
              </Button>
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden border border-border bg-card/50 p-1">
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-muted-foreground/5 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 p-6 w-full max-w-md">
                  {[
                    { title: "Carpentry", count: "124+ Providers" },
                    { title: "Plumbing", count: "98+ Providers" },
                    { title: "Electrical", count: "87+ Providers" },
                    { title: "Tailoring", count: "156+ Providers" }
                  ].map((category, index) => (
                    <div key={index} className="bg-background/80 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center justify-center text-center">
                      <h3 className="font-medium">{category.title}</h3>
                      <p className="text-xs text-muted-foreground">{category.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
