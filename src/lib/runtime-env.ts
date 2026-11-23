import { getCloudflareContext } from "@opennextjs/cloudflare";

type EnvRecord = Record<string, unknown>;

function stringFromEnvRecord(env: EnvRecord | undefined, name: string): string | undefined {
  if (!env) return undefined;
  const value = env[name];
  if (typeof value === "string" && value !== "") return value;
  return undefined;
}

function fromCloudflareBindings(name: string): string | undefined {
  try {
    const ctx = getCloudflareContext();
    return stringFromEnvRecord(ctx.env as EnvRecord, name);
  } catch {
    return undefined;
  }
}

async function fromCloudflareBindingsAsync(name: string): Promise<string | undefined> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    return stringFromEnvRecord(ctx.env as EnvRecord, name);
  } catch {
    return undefined;
  }
}

/**
 * Runtime env for Cloudflare Workers + OpenNext.
 * Dashboard secrets live on the Worker's `env` object; `process.env` may be empty if
 * values were not present at build time or were stripped on deploy.
 */
export function runtimeEnv(name: string): string | undefined {
  return fromCloudflareBindings(name) ?? stringFromProcess(name);
}

export async function runtimeEnvAsync(name: string): Promise<string | undefined> {
  return (
    (await fromCloudflareBindingsAsync(name)) ??
    fromCloudflareBindings(name) ??
    stringFromProcess(name)
  );
}

function stringFromProcess(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined || value === "") return undefined;
  return value;
}

/** Safe flags for /api/health — never expose secret values. */
export function runtimeEnvConfigured(name: string): boolean {
  return runtimeEnv(name) !== undefined;
}