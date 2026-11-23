/**
 * Runtime env lookup for Cloudflare Workers + OpenNext.
 * Bracket access prevents the bundler from inlining `process.env.VAR` as undefined
 * when VAR was absent during the CI build.
 */
export function runtimeEnv(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined || value === "") return undefined;
  return value;
}