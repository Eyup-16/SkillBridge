export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
          phone_number: string | null
          account_status: string | null
          bio: string | null
          last_login_at: string | null
          selected_role: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          phone_number?: string | null
          account_status?: string | null
          bio?: string | null
          last_login_at?: string | null
          selected_role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          phone_number?: string | null
          account_status?: string | null
          bio?: string | null
          last_login_at?: string | null
          selected_role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      worker_profiles: {
        Row: {
          id: string
          full_name: string
          phone_number: string | null
          address: string | null
          city: string
          country: string
          bio: string | null
          avatar_url: string | null
          hourly_rate: number | null
          is_available: boolean | null
          years_experience: number | null
          average_rating: number | null
          total_reviews: number | null
          total_completed_jobs: number | null
          verification_status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name: string
          phone_number?: string | null
          address?: string | null
          city: string
          country: string
          bio?: string | null
          avatar_url?: string | null
          hourly_rate?: number | null
          is_available?: boolean | null
          years_experience?: number | null
          average_rating?: number | null
          total_reviews?: number | null
          total_completed_jobs?: number | null
          verification_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          phone_number?: string | null
          address?: string | null
          city?: string
          country?: string
          bio?: string | null
          avatar_url?: string | null
          hourly_rate?: number | null
          is_available?: boolean | null
          years_experience?: number | null
          average_rating?: number | null
          total_reviews?: number | null
          total_completed_jobs?: number | null
          verification_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      customer_profiles: {
        Row: {
          id: string
          full_name: string
          phone_number: string | null
          default_address_id: number | null
          preferred_payment_method_id: number | null
          total_bookings: number | null
          total_spent: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name: string
          phone_number?: string | null
          default_address_id?: number | null
          preferred_payment_method_id?: number | null
          total_bookings?: number | null
          total_spent?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          phone_number?: string | null
          default_address_id?: number | null
          preferred_payment_method_id?: number | null
          total_bookings?: number | null
          total_spent?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      customer_addresses: {
        Row: {
          id: number
          customer_id: string
          address_line1: string
          address_line2: string | null
          city: string
          state: string | null
          postal_code: string | null
          country: string
          is_default: boolean | null
          address_type: string | null
          latitude: number | null
          longitude: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          customer_id: string
          address_line1: string
          address_line2?: string | null
          city: string
          state?: string | null
          postal_code?: string | null
          country: string
          is_default?: boolean | null
          address_type?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          customer_id?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string | null
          postal_code?: string | null
          country?: string
          is_default?: boolean | null
          address_type?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      customer_payment_methods: {
        Row: {
          id: number
          customer_id: string
          payment_type: string
          provider: string | null
          account_number: string | null
          expiry_date: string | null
          is_default: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          customer_id: string
          payment_type: string
          provider?: string | null
          account_number?: string | null
          expiry_date?: string | null
          is_default?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          customer_id?: string
          payment_type?: string
          provider?: string | null
          account_number?: string | null
          expiry_date?: string | null
          is_default?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      worker_certifications: {
        Row: {
          id: number
          worker_id: string
          certification_name: string
          issuing_organization: string
          issue_date: string
          expiry_date: string | null
          certification_url: string | null
          verification_status: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          worker_id: string
          certification_name: string
          issuing_organization: string
          issue_date: string
          expiry_date?: string | null
          certification_url?: string | null
          verification_status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          worker_id?: string
          certification_name?: string
          issuing_organization?: string
          issue_date?: string
          expiry_date?: string | null
          certification_url?: string | null
          verification_status?: string | null
          created_at?: string | null
        }
      }
      worker_availability: {
        Row: {
          id: number
          worker_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_available: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          worker_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_available?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          worker_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_available?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      service_categories: {
        Row: {
          id: number
          name: string
          description: string | null
          icon: string | null
          parent_id: number | null
          level: number | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          icon?: string | null
          parent_id?: number | null
          level?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          icon?: string | null
          parent_id?: number | null
          level?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
      }
      worker_services: {
        Row: {
          id: number
          worker_id: string
          category_id: number
          title: string
          description: string
          price: number | null
          is_hourly: boolean | null
          min_duration: number | null
          max_duration: number | null
          is_featured: boolean | null
          is_active: boolean | null
          avg_rating: number | null
          total_bookings: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          worker_id: string
          category_id: number
          title: string
          description: string
          price?: number | null
          is_hourly?: boolean | null
          min_duration?: number | null
          max_duration?: number | null
          is_featured?: boolean | null
          is_active?: boolean | null
          avg_rating?: number | null
          total_bookings?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          worker_id?: string
          category_id?: number
          title?: string
          description?: string
          price?: number | null
          is_hourly?: boolean | null
          min_duration?: number | null
          max_duration?: number | null
          is_featured?: boolean | null
          is_active?: boolean | null
          avg_rating?: number | null
          total_bookings?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      service_areas: {
        Row: {
          id: number
          service_id: number
          city: string
          state: string | null
          country: string
          postal_code: string | null
          radius_km: number | null
          created_at: string | null
        }
        Insert: {
          id?: number
          service_id: number
          city: string
          state?: string | null
          country: string
          postal_code?: string | null
          radius_km?: number | null
          created_at?: string | null
        }
        Update: {
          id?: number
          service_id?: number
          city?: string
          state?: string | null
          country?: string
          postal_code?: string | null
          radius_km?: number | null
          created_at?: string | null
        }
      }
      service_images: {
        Row: {
          id: number
          service_id: number
          image_url: string
          is_primary: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: number
          service_id: number
          image_url: string
          is_primary?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: number
          service_id?: number
          image_url?: string
          is_primary?: boolean | null
          created_at?: string | null
        }
      }
      bookings: {
        Row: {
          id: number
          service_id: number
          customer_id: string
          booking_date: string
          start_time: string
          end_time: string | null
          status: string
          notes: string | null
          price: number | null
          payment_status: string | null
          payment_method: string | null
          transaction_id: string | null
          address_id: number | null
          cancellation_reason: string | null
          cancelled_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          service_id: number
          customer_id: string
          booking_date: string
          start_time: string
          end_time?: string | null
          status?: string
          notes?: string | null
          price?: number | null
          payment_status?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          address_id?: number | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          service_id?: number
          customer_id?: string
          booking_date?: string
          start_time?: string
          end_time?: string | null
          status?: string
          notes?: string | null
          price?: number | null
          payment_status?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          address_id?: number | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      booking_payments: {
        Row: {
          id: number
          booking_id: number
          amount: number
          payment_method: string
          transaction_id: string | null
          status: string
          payment_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          booking_id: number
          amount: number
          payment_method: string
          transaction_id?: string | null
          status: string
          payment_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          booking_id?: number
          amount?: number
          payment_method?: string
          transaction_id?: string | null
          status?: string
          payment_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      reviews: {
        Row: {
          id: number
          booking_id: number
          rating: number
          comment: string | null
          worker_response: string | null
          worker_response_at: string | null
          is_featured: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          booking_id: number
          rating: number
          comment?: string | null
          worker_response?: string | null
          worker_response_at?: string | null
          is_featured?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          booking_id?: number
          rating?: number
          comment?: string | null
          worker_response?: string | null
          worker_response_at?: string | null
          is_featured?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      forum_categories: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string | null
        }
      }
      forum_posts: {
        Row: {
          id: number
          category_id: number
          user_id: string
          title: string
          content: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          category_id: number
          user_id: string
          title: string
          content: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          category_id?: number
          user_id?: string
          title?: string
          content?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      forum_comments: {
        Row: {
          id: number
          post_id: number
          user_id: string
          content: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          post_id: number
          user_id: string
          content: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          post_id?: number
          user_id?: string
          content?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      worker_details: {
        Row: {
          id: string
          full_name: string
          phone_number: string | null
          address: string | null
          city: string
          country: string
          bio: string | null
          avatar_url: string | null
          hourly_rate: number | null
          is_available: boolean | null
          years_experience: number | null
          average_rating: number | null
          total_reviews: number | null
          total_completed_jobs: number | null
          verification_status: string | null
          service_count: number | null
          certification_count: number | null
          service_categories: string[] | null
        }
      }
      customer_details: {
        Row: {
          id: string
          full_name: string
          phone_number: string | null
          total_bookings: number | null
          total_spent: number | null
          address_count: number | null
          payment_method_count: number | null
          default_address_line1: string | null
          default_city: string | null
          default_country: string | null
        }
      }
      service_listings: {
        Row: {
          id: number
          title: string
          description: string
          price: number | null
          is_hourly: boolean | null
          min_duration: number | null
          max_duration: number | null
          is_featured: boolean | null
          is_active: boolean | null
          avg_rating: number | null
          total_bookings: number | null
          category_name: string
          category_description: string | null
          category_icon: string | null
          worker_id: string
          worker_name: string
          worker_avatar: string | null
          worker_rating: number | null
          worker_verification: string | null
          service_cities: string[] | null
        }
      }
      booking_details: {
        Row: {
          id: number
          booking_date: string
          start_time: string
          end_time: string | null
          status: string
          notes: string | null
          price: number | null
          payment_status: string | null
          payment_method: string | null
          transaction_id: string | null
          service_id: number
          service_title: string
          service_price: number | null
          service_is_hourly: boolean | null
          worker_id: string
          worker_name: string
          worker_avatar: string | null
          customer_id: string
          customer_name: string
          address_line1: string | null
          city: string | null
          country: string | null
          review_id: number | null
          rating: number | null
          review_comment: string | null
          worker_response: string | null
          category_name: string
        }
      }
      top_rated_workers: {
        Row: {
          category_id: number
          category_name: string
          worker_id: string
          worker_name: string
          worker_avatar: string | null
          average_rating: number | null
          total_reviews: number | null
          city: string
          country: string
          service_count: number | null
        }
      }
      featured_services: {
        Row: {
          id: number
          title: string
          description: string
          price: number | null
          is_hourly: boolean | null
          avg_rating: number | null
          category_name: string
          category_icon: string | null
          worker_id: string
          worker_name: string
          worker_avatar: string | null
          worker_rating: number | null
          service_cities: string[] | null
        }
      }
      recent_reviews: {
        Row: {
          id: number
          rating: number
          comment: string | null
          worker_response: string | null
          created_at: string | null
          booking_id: number
          service_id: number
          service_title: string
          worker_id: string
          worker_name: string
          worker_avatar: string | null
          customer_id: string
          customer_name: string
          category_name: string
        }
      }
      service_availability: {
        Row: {
          service_id: number
          service_title: string
          worker_id: string
          worker_name: string
          day_of_week: number
          start_time: string
          end_time: string
          is_available: boolean | null
          category_name: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
