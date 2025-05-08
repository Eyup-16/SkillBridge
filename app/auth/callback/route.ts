import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorCode = requestUrl.searchParams.get("error_code");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  // Handle OAuth error
  if (error) {
    console.error(`Auth error: ${error}, code: ${errorCode}, description: ${errorDescription}`);
    return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (code) {
    const supabase = await createClient();

    try {
      // Exchange code for session
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        console.error("Error exchanging code for session:", sessionError);
        return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(sessionError.message)}`);
      }

      // After successful authentication, check if the user has a selected role
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        try {
          // Wait a moment to ensure database triggers have time to complete
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Check if the user has a selected role
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("selected_role")
            .eq("id", user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Error fetching user profile in callback:", profileError);
          }

          // If no profile or no selected role, ensure the user is properly set up
          if (!profile || !profile.selected_role) {
            // Ensure the profile exists
            const { error: upsertError } = await supabase
              .from("profiles")
              .upsert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                avatar_url: user.user_metadata?.avatar_url,
                account_status: 'active'
                // No selected_role - user must choose
              });

            if (upsertError) {
              console.error("Error creating profile in callback:", upsertError);
            }

            // Assign default customer role if needed
            const { error: roleError } = await supabase
              .from("user_role_assignments")
              .insert({ user_id: user.id, role_name: 'customer' });

            if (roleError) {
              console.error("Error assigning role in callback:", roleError);

              // If the error is due to unique constraint, it's fine - the role already exists
              if (!roleError.message.includes('unique constraint')) {
                // For other errors, try to continue but log them
                console.error("Non-constraint error assigning role:", roleError);
              }
            }

            // Create customer profile if needed
            const { error: customerProfileError } = await supabase
              .from("customer_profiles")
              .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                total_bookings: 0,
                total_spent: 0
              })
              .onConflict('id')
              .ignore();

            if (customerProfileError) {
              console.error("Error creating customer profile:", customerProfileError);
            }

            return NextResponse.redirect(`${origin}/role-selection`);
          }
        } catch (error) {
          console.error("Exception in auth callback:", error);
          // Continue to dashboard as fallback
        }
      }
    } catch (error) {
      console.error("Unexpected error in auth callback:", error);
      return NextResponse.redirect(`${origin}/sign-in?error=Authentication%20failed`);
    }
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/dashboard`);
}
