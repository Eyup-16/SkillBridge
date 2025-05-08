import { signUpAction } from "@/app/actions";
import { OAuthProviders } from "@/components/auth/oauth-providers";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SmtpMessage } from "../smtp-message";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  // Check if user is already logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to dashboard if already authenticated
  if (user) {
    redirect("/dashboard");
  }

  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto">
      <div className="w-full px-8 py-6 bg-card rounded-lg shadow-sm border">
        <form className="flex flex-col w-full">
          <h1 className="text-2xl font-medium">Join SkillBridge</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Already have an account?{" "}
            <Link className="text-primary font-medium hover:underline" href="/sign-in">
              Sign in
            </Link>
          </p>
          <div className="flex flex-col gap-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input name="fullName" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input name="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                name="password"
                placeholder="Your password"
                minLength={6}
                required
              />
            </div>
            <SubmitButton formAction={signUpAction} pendingText="Signing up..." className="w-full">
              Sign up with Email
            </SubmitButton>
            <FormMessage message={searchParams} />
          </div>
        </form>

        <OAuthProviders />
        <div className="mt-4">
          <SmtpMessage />
        </div>
      </div>
    </div>
  );
}
