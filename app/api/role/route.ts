import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { role } = await request.json();

    if (!role || !["worker", "customer"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if the user has this role assigned
    const { data: roleAssignment, error: roleCheckError } = await supabase
      .from("user_role_assignments")
      .select("*")
      .eq("user_id", user.id)
      .eq("role_name", role)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error when no record is found

    if (roleCheckError && roleCheckError.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
      console.error("Error checking role assignment:", roleCheckError);
      return NextResponse.json(
        { error: "Failed to check role assignment" },
        { status: 500 }
      );
    }

    if (!roleAssignment) {
      // First check if the role exists in user_roles table
      const { data: roleExists } = await supabase
        .from("user_roles")
        .select("name")
        .eq("name", role)
        .single();

      if (!roleExists) {
        console.error("Role does not exist in user_roles table:", role);
        return NextResponse.json(
          { error: "Invalid role. Role does not exist in the system." },
          { status: 400 }
        );
      }

      // Assign the role if it doesn't exist
      const { error: assignmentError } = await supabase
        .from("user_role_assignments")
        .insert({ user_id: user.id, role_name: role });

      if (assignmentError) {
        console.error("Error assigning role:", assignmentError);
        return NextResponse.json(
          { error: `Failed to assign role: ${assignmentError.message}` },
          { status: 500 }
        );
      }
    }

    // Update the selected role
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ selected_role: role })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update selected role" },
        { status: 500 }
      );
    }

    // If the selected role is 'worker' and the user doesn't have a worker profile yet,
    // return a flag to indicate they need to create one
    let needsWorkerProfile = false;
    if (role === "worker") {
      const { data: workerProfile } = await supabase
        .from("worker_profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      needsWorkerProfile = !workerProfile;
    }

    return NextResponse.json({
      success: true,
      role,
      needsWorkerProfile
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
