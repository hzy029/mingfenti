export async function POST() {
  return Response.json(
    { ok: false, reason: "like-disabled", message: "点赞功能已取消。" },
    { status: 410 }
  );
}
