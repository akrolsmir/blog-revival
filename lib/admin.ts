// Server-side InstantDB client (API routes, seed script). Never import in
// client components.
import { init } from "@instantdb/admin";
import schema from "@/instant.schema";

export function adminDb() {
  const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
  const adminToken = process.env.INSTANT_ADMIN_TOKEN;
  if (!appId || !adminToken) {
    throw new Error("Missing NEXT_PUBLIC_INSTANT_APP_ID or INSTANT_ADMIN_TOKEN in .env");
  }
  return init({ appId, adminToken, schema });
}
