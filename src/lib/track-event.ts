import type { AnalyticsPayload } from "@/types/store";

function getUtmParams() {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);

  return {
    source: params.get("utm_source") || "",
    medium: params.get("utm_medium") || "",
    campaign: params.get("utm_campaign") || "",
    term: params.get("utm_term") || "",
    content: params.get("utm_content") || "",
  };
}

export async function trackEvent(payload: AnalyticsPayload) {
  try {
    const utm = getUtmParams();

    await fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-utm-source": utm.source || "",
        "x-utm-medium": utm.medium || "",
        "x-utm-campaign": utm.campaign || "",
        "x-utm-term": utm.term || "",
        "x-utm-content": utm.content || "",
      },
      body: JSON.stringify({
        ...payload,
        path:
          payload.path ||
          (typeof window !== "undefined" ? window.location.pathname : ""),
        referrer:
          payload.referrer ||
          (typeof document !== "undefined" ? document.referrer : ""),
      }),
    });
  } catch (error) {
    console.warn("trackEvent failed:", error);
  }
}