// src/lib/types.ts
// Simple database types for Supabase usage in this app.

export type PetType = "kedi" | "köpek";
export type ReminderType = "vaccine" | "checkup" | "grooming" | "food";
export type RecurrenceType = "none" | "weekly" | "monthly" | "yearly";
export type UserPlan = "free" | "premium";

export interface ProfilesRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_premium: boolean | null; // legacy (unused, can be removed later)
  plan: UserPlan | null;      // new plan field
  openai_api_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface PetsRow {
  id: string;
  user_id: string;
  name: string;
  pet_type: PetType;
  breed: string | null;
  age: number | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RemindersRow {
  id: string;
  user_id: string;
  pet_id: string;
  type: ReminderType;
  title: string | null;
  due_at: string;            // ISO timestamp
  due_date: string | null;   // 'YYYY-MM-DD' (Europe/Istanbul local date)
  recurrence: RecurrenceType;
  notes: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfilesRow;
        Insert: Partial<ProfilesRow>;
        Update: Partial<ProfilesRow>;
      };
      pets: {
        Row: PetsRow;
        Insert: Omit<PetsRow, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<PetsRow>;
      };
      reminders: {
        Row: RemindersRow;
        Insert: Omit<
          RemindersRow,
          "id" | "created_at" | "updated_at" | "completed" | "due_date"
        > & {
          id?: string;
          completed?: boolean;
          due_date?: string | null;
        };
        Update: Partial<RemindersRow>;
      };
      push_subscriptions: {
        Row: PushSubscriptionRow;
        Insert: Omit<PushSubscriptionRow, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<PushSubscriptionRow>;
      };
    };
    Enums: {
      pet_type: PetType;
      reminder_type: ReminderType;
      recurrence_type: RecurrenceType;
      user_plan: UserPlan;
    };
  };
}