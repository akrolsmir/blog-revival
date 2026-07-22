// Wipe all app data (not $users). Run before re-seeding:
//   bun run scripts/reset.ts && bun run scripts/seed.ts

import { init } from "@instantdb/admin";
import schema from "../instant.schema";

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const adminToken = process.env.INSTANT_ADMIN_TOKEN;
if (!appId || !adminToken) {
  console.error("Set NEXT_PUBLIC_INSTANT_APP_ID and INSTANT_ADMIN_TOKEN in .env");
  process.exit(1);
}
const db = init({ appId, adminToken, schema });

async function main() {
  const data = await db.query({
    pledges: {},
    comments: {},
    bloggers: {},
    profiles: {},
    settings: {},
  });
  const txs = [
    ...data.pledges.map((r) => db.tx.pledges[r.id].delete()),
    ...data.comments.map((r) => db.tx.comments[r.id].delete()),
    ...data.bloggers.map((r) => db.tx.bloggers[r.id].delete()),
    ...data.profiles.map((r) => db.tx.profiles[r.id].delete()),
    ...data.settings.map((r) => db.tx.settings[r.id].delete()),
  ];
  if (txs.length) await db.transact(txs);
  console.log(`Deleted ${txs.length} rows.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
