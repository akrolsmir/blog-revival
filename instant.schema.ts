// Blog Revival Project — InstantDB schema
// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),

    // A person using the site. One profile per $user; a profile can act as
    // both patron and blogger.
    profiles: i.entity({
      handle: i.string().unique().indexed(),
      displayName: i.string(),
      bio: i.string().optional(),
      photoUrl: i.string().optional(),
      // Patron profile fields
      favoriteAliveBlogs: i.json().optional(), // [{ name, url }]
      favoriteDeadBlogs: i.json().optional(), // [{ name, url }]
      postsILike: i.string().optional(), // "what kind of posts I like"
      // Pledge credit (in cents). Granted server-side: $25 to the first 100
      // signups; gotSignupCredit guards against double-granting.
      creditCents: i.number().optional(),
      gotSignupCredit: i.boolean().optional(),
      createdAt: i.number(),
    }),

    // A dormant blogger we want to revive. Exists before anyone claims it.
    bloggers: i.entity({
      slug: i.string().unique().indexed(),
      name: i.string(),
      pseudonymous: i.boolean().optional(),
      blogName: i.string().optional(),
      blogUrl: i.string(),
      photoUrl: i.string().optional(),
      epitaph: i.string().optional(), // one-line memorial text
      lastPostAt: i.number().optional().indexed(), // ms epoch of last substantive post (optional)
      recentPosts: i.json().optional(), // [{ title, url, date }]
      // funding | live | revived (post published) | paid (bounty claimed)
      status: i.string().indexed(),
      revivalPostUrl: i.string().optional(),
      revivalPostTitle: i.string().optional(),
      // Set when a blogger claims payout / redirects / donates
      bountyDirection: i.string().optional(), // withdraw | redirect | charity
      bountyDirectionDetail: i.string().optional(),
      stripeAccountId: i.string().optional(),
      claimVerified: i.boolean().optional(),
      createdAt: i.number(),
    }),

    // A patron's pledge toward a blogger's bounty.
    pledges: i.entity({
      amountCents: i.number(),
      note: i.string().optional(), // why you want them back
      // personal bounties from Austin/Carol's pots skip the matching pool
      source: i.string().indexed(), // patron | austin | carol
      status: i.string().indexed(), // pending | paid
      stripeSessionId: i.string().optional().indexed(),
      createdAt: i.number().indexed(),
    }),

    // Patron comments on a blogger page: why you loved this blog.
    comments: i.entity({
      text: i.string(),
      createdAt: i.number().indexed(),
    }),

    // Singleton app config.
    settings: i.entity({
      key: i.string().unique().indexed(),
      matchingPoolCents: i.number(),
      liveThresholdCents: i.number(),
    }),

    // A reader's suggestion of a dormant blog to revive. Written server-side
    // by a signed-in submitter; stays pending until an admin approves it,
    // which spins up a bloggers row (a live bounty).
    nominations: i.entity({
      blogName: i.string().optional(),
      authorName: i.string(), // the blogger's name or pseudonym
      blogUrl: i.string(),
      lastPostAt: i.number().optional(), // ms epoch of their last post (optional)
      topPosts: i.json().optional(), // [{ title, url }]
      status: i.string().indexed(), // pending | approved | rejected
      createdAt: i.number().indexed(),
    }),
  },

  links: {
    profileUser: {
      forward: { on: "profiles", has: "one", label: "user" },
      reverse: { on: "$users", has: "one", label: "profile" },
    },
    bloggerClaimedBy: {
      forward: { on: "bloggers", has: "one", label: "claimedBy" },
      reverse: { on: "profiles", has: "many", label: "claimedBloggers" },
    },
    pledgePatron: {
      forward: { on: "pledges", has: "one", label: "patron" },
      reverse: { on: "profiles", has: "many", label: "pledges" },
    },
    pledgeBlogger: {
      forward: { on: "pledges", has: "one", label: "blogger" },
      reverse: { on: "bloggers", has: "many", label: "pledges" },
    },
    commentAuthor: {
      forward: { on: "comments", has: "one", label: "author" },
      reverse: { on: "profiles", has: "many", label: "comments" },
    },
    commentBlogger: {
      forward: { on: "comments", has: "one", label: "blogger" },
      reverse: { on: "bloggers", has: "many", label: "comments" },
    },
    // A blogger may redirect their bounty to revive another blogger.
    bountyRedirect: {
      forward: { on: "bloggers", has: "one", label: "redirectTo" },
      reverse: { on: "bloggers", has: "many", label: "redirectsReceived" },
    },
    nominationSubmitter: {
      forward: { on: "nominations", has: "one", label: "submitter" },
      reverse: { on: "profiles", has: "many", label: "nominations" },
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
