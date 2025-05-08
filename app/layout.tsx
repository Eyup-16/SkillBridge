import { Toaster } from "@/components/ui/toaster";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { LayoutProvider } from "@/components/layout/layout-context";
import { UserProfileProvider } from "@/contexts/user-profile-context";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "SkillBridge - Community Skill-Sharing Platform",
  description: "Connect with local skilled workers for services in your community",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutProvider>
            <UserProfileProvider>
              <main className="min-h-screen flex flex-col items-center">
                <div className="flex-1 w-full flex flex-col gap-20 items-center">
                  <SiteHeader />
                  <div className="container flex-1 py-8">
                    {children}
                  </div>
                  <SiteFooter />
                </div>
              </main>
              <Toaster />
            </UserProfileProvider>
          </LayoutProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
