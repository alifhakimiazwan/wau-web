"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DesignCustomization } from "./types";
import type { Database } from "@/types/database.types";

type StoreCustomization = Database["public"]["Tables"]["store_customization"]["Row"];

/**
 * Transforms raw database customization data to DesignCustomization type
 * @internal - Helper function used only within this module
 */
function transformCustomization(
  customization: StoreCustomization | null
): DesignCustomization | null {
  if (!customization) return null;

  return {
    themeId: customization.theme || "minimal_white",
    fontFamily: customization.font_family || "Inter",
    colors: {
      primary: customization.primary_color || "#000000",
      accent: customization.accent_color || "#3B82F6",
    },
    blockShape:
      (customization.block_shape as "square" | "rounded" | "pill") || "rounded",
    buttonConfig: {
      style:
        (customization.button_style as "filled" | "outlined" | "ghost") ||
        "filled",
    },
  };
}

/**
 * Fetches and transforms design customization for a given store
 * @param storeId - The ID of the store
 * @returns DesignCustomization object or null if not found
 */
export async function getDesignCustomization(
  storeId: string
): Promise<DesignCustomization | null> {
  const supabase = await createServerSupabaseClient();

  const { data: customization } = await supabase
    .from("store_customization")
    .select("*")
    .eq("store_id", storeId)
    .maybeSingle();

  return transformCustomization(customization);
}

/**
 * Fetches raw store customization (for cases where you need the raw DB data)
 * @param storeId - The ID of the store
 * @returns Raw store customization data or null
 */
export async function getRawCustomization(
  storeId: string
): Promise<StoreCustomization | null> {
  const supabase = await createServerSupabaseClient();

  const { data: customization } = await supabase
    .from("store_customization")
    .select("*")
    .eq("store_id", storeId)
    .maybeSingle();

  return customization;
}
