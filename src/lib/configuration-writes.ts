import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";

export const STALE_SETTINGS_MESSAGE = "These settings were changed by someone else. Reload and try again.";

/** Database owns locking, version comparison, domain merging and authorization. */
export async function writeVersionedConfiguration<T extends { version: number }>(
  client: SupabaseClient<Database>, schoolId: string, key: string, incoming: T,
  parse: (raw: unknown) => T, columns: Record<string, unknown> = {},
): Promise<T> {
  const { data, error } = await client.rpc("write_school_configuration", {
    _school_id: schoolId, _key: key, _incoming: incoming as unknown as Json,
    _columns: columns as Json,
  });
  if (error) throw new Error(error.code === "40001" ? STALE_SETTINGS_MESSAGE : error.message);
  const saved = parse(data);
  if (saved.version !== incoming.version + 1) throw new Error("Could not confirm the saved configuration version.");
  return saved;
}

export async function writeModulePolicy(
  client: SupabaseClient<Database>, schoolId: string,
  features: Record<string, boolean>, weekStartsOn: "monday" | "sunday",
) {
  const { error } = await client.rpc("write_school_module_policy", {
    _school_id: schoolId, _features: features, _week_starts_on: weekStartsOn,
  });
  if (error) throw new Error(error.message);
}