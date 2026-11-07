import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getRoles } from "@/lib/admin.server";
import { loadTeachingScope } from "@/lib/teaching.server";
import { writeModulePolicy, writeVersionedConfiguration, STALE_SETTINGS_MESSAGE } from "@/lib/configuration-writes";

function roleClient(roles: string[], failure: boolean = false) {
  const from = vi.fn((table: string) => {
    if (table !== "user_roles") throw new Error("Unexpected authorization source");
    return { select: () => ({ eq: async () => ({ data: roles.map(role => ({ role })), error: failure ? { message: "denied" } : null }) }) };
  });
  return { from } as unknown as SupabaseClient<Database>;
}

describe("protected authorization source", () => {
  it("does not grant profile privileges when protected roles are missing", async () => {
    expect(await getRoles(roleClient([]), "caller")).toEqual([]);
  });
  it("rejects permission query errors instead of granting fallback privileges", async () => {
    await expect(getRoles(roleClient([], true), "caller")).rejects.toThrow("Could not verify");
  });
  it("preserves the protected student role in shared teaching scope", async () => {
    expect(await loadTeachingScope(roleClient(["student"]), "caller")).toEqual({ isAdmin: false, role: "student", pairs: [], classes: [], subjects: [] });
  });
  it("preserves guardian identity without granting teacher permissions", async () => {
    const scope = await loadTeachingScope(roleClient(["parent"]), "caller");
    expect(scope.role).toBe("parent");
    expect(scope.isAdmin).toBe(false);
  });
});

describe("atomic configuration callers", () => {
  const incoming = { version: 0, library: [] };
  const parse = (raw: unknown) => raw as typeof incoming;
  it("sends only one domain to the atomic save operation", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { ...incoming, version: 1 }, error: null });
    const client = { rpc } as unknown as SupabaseClient<Database>;
    const saved = await writeVersionedConfiguration(client, "school-a", "__operations_rules", incoming, parse);
    expect(saved.version).toBe(1);
    expect(rpc).toHaveBeenCalledExactlyOnceWith("write_school_configuration", { _school_id: "school-a", _key: "__operations_rules", _incoming: incoming, _columns: {} });
  });
  it("propagates the database stale-version rejection", async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: null, error: { code: "40001", message: "stale" } }) } as unknown as SupabaseClient<Database>;
    await expect(writeVersionedConfiguration(client, "school-a", "__operations_rules", incoming, parse)).rejects.toThrow(STALE_SETTINGS_MESSAGE);
  });
  it("rejects an unconfirmed version instead of reporting success", async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: incoming, error: null }) } as unknown as SupabaseClient<Database>;
    await expect(writeVersionedConfiguration(client, "school-a", "__operations_rules", incoming, parse)).rejects.toThrow("Could not confirm");
  });
  it("sends feature switches without copying versioned domain documents", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    await writeModulePolicy({ rpc } as unknown as SupabaseClient<Database>, "school-a", { library: false }, "monday");
    expect(rpc).toHaveBeenCalledExactlyOnceWith("write_school_module_policy", { _school_id: "school-a", _features: { library: false }, _week_starts_on: "monday" });
  });
});