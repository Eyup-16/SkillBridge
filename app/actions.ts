"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Provider } from "@supabase/supabase-js";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("fullName")?.toString() || email?.split('@')[0];
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  try {
    // Sign up the user with additional metadata
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      console.error("Sign-up error:", error.code, error.message);
      return encodedRedirect("error", "/sign-up", error.message);
    }

    // Wait a moment to ensure database triggers have time to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  } catch (err) {
    console.error("Unexpected error during sign-up:", err);
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
    return encodedRedirect("error", "/sign-up", errorMessage);
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // Check if the user has a selected role
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("selected_role")
      .eq("id", user.id)
      .single();

    // If no selected role, redirect to role selection
    if (!profile?.selected_role) {
      return redirect("/role-selection");
    }

    // Otherwise, redirect to dashboard
    return redirect("/dashboard");
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const signInWithOAuthAction = async (formData: FormData) => {
  const provider = formData.get("provider")?.toString() as Provider;
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!provider) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "Provider is required"
    );
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error("OAuth sign-in error:", error.message);
      return encodedRedirect("error", "/sign-in", error.message);
    }

    if (!data?.url) {
      console.error("OAuth sign-in failed: No URL returned");
      return encodedRedirect("error", "/sign-in", "Authentication failed. Please try again.");
    }

    return redirect(data.url);
  } catch (err) {
    console.error("Unexpected error during OAuth sign-in:", err);
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
    return encodedRedirect("error", "/sign-in", errorMessage);
  }
};
