import { FeaturedCategories } from "@/components/home/featured-categories";
import { HomeHero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="flex flex-col gap-4">
      <HomeHero />
      <FeaturedCategories />
      <HowItWorks />
      <Testimonials />

      <div className="py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
          Ready to Get Started?
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/services">Find Services</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/sign-up">Become a Provider</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
