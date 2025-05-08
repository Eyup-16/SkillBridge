"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

// Define the shape of the profile data
interface ProfileData {
  id: string;
  full_name?: string;
  avatar_url?: string | null;
  selected_role?: string;
  email?: string;
  phone_number?: string;
  bio?: string;
  account_status?: string;
  created_at?: string;
  updated_at?: string;
}

// Define the context shape
interface UserProfileContextType {
  user: User | null;
  profile: ProfileData | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  updateAvatar: (url: string | null) => Promise<void>;
}

// Create the context with default values
const UserProfileContext = createContext<UserProfileContextType>({
  user: null,
  profile: null,
  isLoading: true,
  refreshProfile: async () => {},
  updateAvatar: async () => {},
});

// Provider component
export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Function to fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUser(null);
        setProfile(null);
        return;
      }
      
      setUser(user);
      
      // Get user's profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData as ProfileData);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh the profile data
  const refreshProfile = async () => {
    await fetchUserProfile();
  };

  // Function to update avatar URL
  const updateAvatar = async (url: string | null) => {
    if (!user) return;
    
    try {
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update worker profile if exists
      const { data: workerProfile } = await supabase
        .from("worker_profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      
      if (workerProfile) {
        await supabase
          .from("worker_profiles")
          .update({ avatar_url: url })
          .eq("id", user.id);
      }
      
      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
    } catch (error) {
      console.error("Error updating avatar:", error);
      throw error;
    }
  };

  // Initial fetch and auth state change listener
  useEffect(() => {
    fetchUserProfile();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          setUser(session?.user || null);
          fetchUserProfile();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserProfileContext.Provider
      value={{
        user,
        profile,
        isLoading,
        refreshProfile,
        updateAvatar,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

// Custom hook to use the context
export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}
