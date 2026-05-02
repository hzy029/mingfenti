import { getBasicStats } from "@/lib/basic-stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await getBasicStats();

  return Response.json(stats, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
