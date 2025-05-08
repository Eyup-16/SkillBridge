import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { user } } = await supabase.auth.getUser();

    // Authentication checks
    if (!user) {
      // Redirect unauthenticated users trying to access protected routes to sign in
      if (
        request.nextUrl.pathname.startsWith("/dashboard") ||
        request.nextUrl.pathname.startsWith("/protected") ||
        request.nextUrl.pathname === "/role-selection"
      ) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    } else {
      // For authenticated users

      // Redirect authenticated users away from auth pages
      if (
        request.nextUrl.pathname === "/sign-in" ||
        request.nextUrl.pathname === "/sign-up" ||
        request.nextUrl.pathname === "/forgot-password"
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Check if the user has a selected role
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("selected_role")
          .eq("id", user.id)
          .single();

        // Store the profile data for use below
        request.headers.set('x-user-profile', JSON.stringify(profile));
      } catch (error) {
        console.error("Error fetching user profile in middleware:", error);
        // Continue without profile data, will be handled below
      }

      // Get the profile data from the header we set above
      const profileHeader = request.headers.get('x-user-profile');
      const profile = profileHeader ? JSON.parse(profileHeader) : null;

      // If user is authenticated but has no role selected, redirect to role selection
      // unless they're already on the role selection page
      if (!profile?.selected_role && request.nextUrl.pathname !== "/role-selection") {
        // Only redirect to role selection if they're trying to access protected routes
        // but make an exception for the create-worker-profile route which is handled specially
        if (
          (request.nextUrl.pathname.startsWith("/dashboard") &&
           request.nextUrl.pathname !== "/dashboard/create-worker-profile") ||
          request.nextUrl.pathname.startsWith("/protected")
        ) {
          return NextResponse.redirect(new URL("/role-selection", request.url));
        }
      }

      // Redirect authenticated users from home page to dashboard
      if (request.nextUrl.pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Redirect authenticated users from old protected route to dashboard
      if (request.nextUrl.pathname.startsWith("/protected")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
