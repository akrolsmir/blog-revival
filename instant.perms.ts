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
      // the claiming flow; claimed bloggers can update their own row.
      create: "false",
      update: "isClaimant",
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
