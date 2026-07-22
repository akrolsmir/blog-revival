"use client";

import { init } from "@instantdb/react";
import schema from "@/instant.schema";

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;

if (!appId) {
  // Surface a clear message during setup rather than a cryptic init error.
  // eslint-disable-next-line no-console
  console.warn(
    "NEXT_PUBLIC_INSTANT_APP_ID is not set — add it to .env to connect InstantDB."
  );
}

export const db = init({ appId: appId ?? "missing-app-id", schema });
