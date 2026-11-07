import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Operational school comes only from the authenticated, active membership.
 * Missing or ambiguous membership never selects another school's first row.
 */
export async function resolveProvisionedSchool(
  supabase: SupabaseClient | any,
): Promise<{ id: string; name: string; currency: string; locale: string } | null> {
  const { data: schoolId, error: scopeError } = await supabase.rpc("resolve_school_context");
  if (scopeError || !schoolId) throw new Error("An active, unambiguous school membership is required.");
  const { data, error } = await supabase
    .from("schools")
    .select("id, name, currency, locale")
    .eq("id", schoolId)
    .eq("active", true)
    .maybeSingle();
  if (error) throw new Error("Could not read the authorized school.");
  return data ?? null;
}

/** All operational configuration readers use this tenant-bound query. */
export async function readSchoolSettings(supabase: any, schoolId?: string) {
  const id = schoolId ?? (await resolveProvisionedSchool(supabase))?.id;
  if (!id) throw new Error("School configuration is unavailable.");
  const { data, error } = await supabase.from("tenant_settings").select("*").eq("school_id", id).maybeSingle();
  if (error) throw new Error("Could not read school configuration.");
  return data;
}
