"use client";

import { supabase } from "../../../lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface ProfileRecord {
  id: string;
  full_name: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
  bio: string | null;
  country: string | null;
}

export interface ProfileFormValues {
  full_name: string;
  username: string;
  bio: string;
  country: string;
}

export const EMPTY_PROFILE_VALUES: ProfileFormValues = {
  full_name: "",
  username: "",
  bio: "",
  country: "",
};

const PROFILE_TABLE = "profiles";

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function profileToFormValues(profile: ProfileRecord): ProfileFormValues {
  return {
    full_name: profile.full_name || "",
    username: profile.username || "",
    bio: profile.bio || "",
    country: profile.country || "",
  };
}

export function buildFallbackProfile(user: User): ProfileRecord {
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
  const username = user.user_metadata?.username || user.email?.split("@")[0] || "";

  return {
    id: user.id,
    full_name: fullName,
    username,
    email: user.email || "",
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.updated_at || user.created_at || new Date().toISOString(),
    bio: "",
    country: "",
  };
}

export function formatAccountDate(value: string | null | undefined) {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export async function getAccountProfile(user: User): Promise<ProfileRecord> {
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select("id, full_name, username, email, created_at, updated_at, bio, country")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return buildFallbackProfile(user);
  }

  return {
    id: data.id,
    full_name: data.full_name || "",
    username: data.username || "",
    email: data.email || user.email || "",
    created_at: data.created_at || user.created_at || new Date().toISOString(),
    updated_at: data.updated_at || data.created_at || user.updated_at || new Date().toISOString(),
    bio: data.bio ?? "",
    country: data.country ?? "",
  };
}

export async function saveAccountProfile(user: User, values: ProfileFormValues): Promise<ProfileRecord> {
  const normalizedUsername = normalizeUsername(values.username);
  const trimmedFullName = values.full_name.trim();
  const trimmedBio = values.bio.trim();
  const trimmedCountry = values.country.trim();

  if (!trimmedFullName) {
    throw new Error("Full name is required.");
  }

  if (!normalizedUsername) {
    throw new Error("Username is required.");
  }

  const { data: duplicateUsername, error: usernameCheckError } = await supabase
    .from(PROFILE_TABLE)
    .select("id")
    .eq("username", normalizedUsername)
    .neq("id", user.id)
    .maybeSingle();

  if (usernameCheckError) {
    throw new Error(usernameCheckError.message);
  }

  if (duplicateUsername) {
    throw new Error("That username is already taken.");
  }

  const nowIso = new Date().toISOString();
  const payload = {
    id: user.id,
    full_name: trimmedFullName,
    username: normalizedUsername,
    email: user.email || "",
    bio: trimmedBio,
    country: trimmedCountry,
    updated_at: nowIso,
  };

  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .upsert(payload, { onConflict: "id" })
    .select("id, full_name, username, email, created_at, updated_at, bio, country")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { error: authUpdateError } = await supabase.auth.updateUser({
    data: {
      full_name: trimmedFullName,
      username: normalizedUsername,
    },
  });

  if (authUpdateError) {
    console.warn("Profile saved, but auth metadata sync failed:", authUpdateError.message);
  }

  return {
    id: data.id,
    full_name: data.full_name || trimmedFullName,
    username: data.username || normalizedUsername,
    email: data.email || user.email || "",
    created_at: data.created_at || nowIso,
    updated_at: data.updated_at || nowIso,
    bio: data.bio ?? "",
    country: data.country ?? "",
  };
}

