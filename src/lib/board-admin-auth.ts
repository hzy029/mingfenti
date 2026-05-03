function timingSafeEqualStrings(expected: string, provided: string): boolean {
  if (expected.length !== provided.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ provided.charCodeAt(index);
  }

  return mismatch === 0;
}

export function getAdminBoardSecretFromRequest(request: Request): string | undefined {
  const header = request.headers.get("x-admin-board-secret");

  return header?.trim() || undefined;
}

export function isAdminBoardAuthorized(request: Request): boolean {
  const expected = process.env.ADMIN_BOARD_SECRET?.trim();

  if (!expected) {
    return false;
  }

  const provided = getAdminBoardSecretFromRequest(request);

  if (!provided) {
    return false;
  }

  return timingSafeEqualStrings(expected, provided);
}

export function adminBoardUnauthorizedResponse() {
  return Response.json({ ok: false, reason: "unauthorized" }, { status: 401 });
}

export function adminBoardDisabledResponse() {
  return Response.json({ ok: false, reason: "admin-not-configured" }, { status: 503 });
}
