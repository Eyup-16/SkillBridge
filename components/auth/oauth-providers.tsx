"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { GithubIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function OAuthProviders() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<{
    google: boolean;
    github: boolean;
  }>({
    google: false,
    github: false,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const supabase = createClient();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
        router.push('/dashboard');
      }
    };

    checkAuth();
  }, [router, supabase.auth]);

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      setIsLoading((prev) => ({ ...prev, [provider]: true }));

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    } finally {
      setIsLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  // Don't render if user is authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading.google}
          onClick={() => handleOAuthSignIn("google")}
          className="flex items-center justify-center gap-2"
        >
          {isLoading.google ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chrome"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <line x1="21.17" x2="12" y1="8" y2="8" />
              <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
              <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
            </svg>
          )}
          Google
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={isLoading.github}
          onClick={() => handleOAuthSignIn("github")}
          className="flex items-center justify-center gap-2"
        >
          {isLoading.github ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <GithubIcon className="h-4 w-4" />
          )}
          GitHub
        </Button>
      </div>
    </div>
  );
}
