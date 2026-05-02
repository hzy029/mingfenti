import { getCloudflareContext } from "@opennextjs/cloudflare";

export type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  run: () => Promise<unknown>;
  all: <T = unknown>() => Promise<{ results?: T[] }>;
};

export type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
};

type CloudflareContextWithDb = {
  env?: {
    DB?: D1Database;
  };
};

export async function getD1Database(): Promise<D1Database | undefined> {
  try {
    const context = (await getCloudflareContext({ async: true })) as CloudflareContextWithDb;

    return context.env?.DB;
  } catch {
    return undefined;
  }
}
