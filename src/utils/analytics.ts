import { track as vercelTrack } from "@vercel/analytics";

/**
 * Track a custom event using Vercel Analytics
 *
 * @param eventName The name of the event to track
 * @param properties Optional properties to include with the event
 */
export const track = (
  eventName: string,
  properties?: Record<string, string | number | boolean>
) => {
  try {
    vercelTrack(eventName, properties);
    console.log(`[Analytics] Tracked: ${eventName}`, properties ?? "");
  } catch (error) {
    console.error(`[Analytics] Error tracking ${eventName}:`, error);
  }
};
