// Blog Revival Project — InstantDB permissions
// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  profiles: {
    allow: {
      view: "true",
      // creditCents/gotSignupCredit are server-controlled (grant + spend go
      // through the admin SDK). Clients own their profile but can't set or
      // change their own balance.
      create: "isOwner && data.creditCents == null && data.gotSignupCredit == null",
      update:
        "isOwner && newData.creditCents == data.creditCents && newData.gotSignupCredit == data.gotSignupCredit",
      delete: "false",
    },
    bind: ["isOwner", "auth.id != null && auth.id in data.ref('user.id')"],
  },
  bloggers: {
    allow: {
      view: "true",
      // Blogger rows are created/updated by the server (admin SDK) or by
      // the claiming flow. A claimant may update their own row, but ONLY to
      // link a revival post (status funding -> revived). Every field that
      // gates or moves money — claimVerified (admin review), stripeAccountId,
      // bountyDirection, slug, and the `paid` status transition — is
      // server-only, else a claimant could self-approve their own payout.
      create: "false",
      update:
        "isClaimant" +
        " && newData.claimVerified == data.claimVerified" +
        " && newData.stripeAccountId == data.stripeAccountId" +
        " && newData.bountyDirection == data.bountyDirection" +
        " && newData.slug == data.slug" +
        " && (newData.status == data.status || newData.status == 'revived')",
      delete: "false",
    },
    bind: ["isClaimant", "auth.id != null && auth.id in data.ref('claimedBy.user.id')"],
  },
  pledges: {
    allow: {
      view: "true",
      // Pledges are written by the server after Stripe checkout.
      create: "false",
      update: "false",
      delete: "false",
    },
  },
  comments: {
    allow: {
      view: "true",
      create: "isAuthor",
      update: "isAuthor",
      delete: "isAuthor",
    },
    bind: ["isAuthor", "auth.id != null && auth.id in data.ref('author.user.id')"],
  },
  settings: {
    allow: {
      view: "true",
      create: "false",
      update: "false",
      delete: "false",
    },
  },
  nominations: {
    // Entirely server-mediated: submitted via /api/nominations (signed-in) and
    // read/approved by admins via /api/nominations/*. No client access.
    allow: {
      view: "false",
      create: "false",
      update: "false",
      delete: "false",
    },
  },
} satisfies InstantRules;

export default rules;
