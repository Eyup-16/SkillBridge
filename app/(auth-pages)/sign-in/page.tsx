import { signInAction } from "@/app/actions";
import { OAuthProviders } from "@/components/auth/oauth-providers";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Login(props: { searchParams: Promise<Message> }) {
  // Check if user is already logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to dashboard if already authenticated
  if (user) {
    redirect("/dashboard");
  }

  const searchParams = await props.searchParams;
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto">
      <div className="w-full px-8 py-6 bg-card rounded-lg shadow-sm border">
        <form className="flex flex-col w-full">
          <h1 className="text-2xl font-medium">Sign in to SkillBridge</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Don't have an account?{" "}
            <Link className="text-primary font-medium hover:underline" href="/sign-up">
              Sign up
            </Link>
          </p>
          <div className="flex flex-col gap-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input name="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  className="text-xs text-primary hover:underline"
                  href="/forgot-password"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                placeholder="Your password"
                required
              />
            </div>
            <SubmitButton pendingText="Signing In..." formAction={signInAction} className="w-full">
              Sign in with Email
            </SubmitButton>
            <FormMessage message={searchParams} />
          </div>
        </form>

        <OAuthProviders />
      </div>
    </div>
  );
}
