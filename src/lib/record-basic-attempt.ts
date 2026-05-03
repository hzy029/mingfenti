import type { BasicTestSession } from "@/lib/basic-test-session";

export function recordBasicAttempt(session: BasicTestSession, resultTitle: string) {
  const payload = JSON.stringify({
    resultId: session.resultId,
    resultTitle,
    historyKnowledge: session.score.historyKnowledge,
    mingPreference: session.score.mingPreference,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    durationSeconds: session.durationSeconds
  });

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/basic-attempts", blob);
    return;
  }

  if (typeof fetch !== "undefined") {
    void fetch("/api/basic-attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true
    }).catch(() => {
      // Result display must not depend on analytics storage.
    });
  }
}
