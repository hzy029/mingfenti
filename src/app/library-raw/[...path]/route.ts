import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

const UTF8_MARKDOWN = "text/markdown; charset=utf-8";

function respondMarkdown(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": UTF8_MARKDOWN,
      "Cache-Control": "public, max-age=86400"
    }
  });
}

function readFromPublicDisk(segments: string[]): Response | null {
  const root = path.join(process.cwd(), "public", "library-raw");
  const joined = path.join(root, ...segments);
  const resolved = path.resolve(joined);
  const rootResolved = path.resolve(root);

  if (!resolved.startsWith(rootResolved + path.sep) && resolved !== rootResolved) {
    return null;
  }

  if (!resolved.endsWith(".md") || !existsSync(resolved)) {
    return null;
  }

  return respondMarkdown(readFileSync(resolved, "utf8"));
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params;

  if (!segments?.length) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const { env } = await getCloudflareContext({ async: true });

    if (env.ASSETS) {
      const upstream = await env.ASSETS.fetch(request);

      if (upstream.ok) {
        const text = await upstream.text();

        return respondMarkdown(text);
      }
    }
  } catch {
    /* 本地纯 Node / 无 Workers 绑定时走磁盘 */
  }

  const disk = readFromPublicDisk(segments);

  if (disk) {
    return disk;
  }

  return new Response("Not found", { status: 404 });
}
