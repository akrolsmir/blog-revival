// Seed the Blog Revival Project database with the launch roster.
// Run: bun run scripts/seed.ts   (needs NEXT_PUBLIC_INSTANT_APP_ID + INSTANT_ADMIN_TOKEN in .env)

import { init, id } from "@instantdb/admin";
import schema from "../instant.schema";

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const adminToken = process.env.INSTANT_ADMIN_TOKEN;
if (!appId || !adminToken) {
  console.error("Set NEXT_PUBLIC_INSTANT_APP_ID and INSTANT_ADMIN_TOKEN in .env");
  process.exit(1);
}
const db = init({ appId, adminToken, schema });

const DAY = 86_400_000;
const now = Date.now();

type SeedBlogger = {
  slug: string;
  name: string;
  pseudonymous?: boolean;
  blogName?: string;
  blogUrl: string;
  daysSilent: number;
  epitaph: string;
  recentPosts: { title: string; url: string; date: string }[];
  // [amountCents, patronHandle|austin|carol, note?][]
  pledges: [number, string, string?][];
};

const patrons: {
  handle: string;
  displayName: string;
  bio?: string;
  postsILike?: string;
  favoriteAliveBlogs?: { name: string; url: string }[];
  favoriteDeadBlogs?: { name: string; url: string }[];
}[] = [
  {
    handle: "austin",
    displayName: "Austin Chen",
    bio: "Manifund. Distributing $5k in personal bounties for bloggers I miss.",
    postsILike:
      "Writing that changed what I work on: career-defining posts, sincere retrospectives, and anything with real numbers in it.",
    favoriteAliveBlogs: [
      { name: "Astral Codex Ten", url: "https://astralcodexten.com" },
      { name: "Dan Luu", url: "https://danluu.com" },
    ],
    favoriteDeadBlogs: [
      { name: "Cold Takes", url: "https://www.cold-takes.com" },
      { name: "Applied Divinity Studies", url: "https://applieddivinitystudies.com" },
    ],
  },
  {
    handle: "carol",
    displayName: "Carol",
    bio: "Manifund. My $5k of personal bounties goes to writing about minds and how to care for them.",
    postsILike:
      "Alignment writing that a careful outsider can check, and essays about caring about things on purpose.",
    favoriteDeadBlogs: [
      { name: "Minding Our Way", url: "https://mindingourway.com" },
      { name: "Nintil", url: "https://nintil.com" },
    ],
  },
  {
    handle: "earlyreader",
    displayName: "Early Reader",
    postsILike: "I want the posts people write once a decade, not once a week.",
  },
  {
    handle: "sqrtfan",
    displayName: "Square Root Enthusiast",
    postsILike: "Small pledges, many of us. That's the whole point.",
  },
  {
    handle: "quietlurker",
    displayName: "Quiet Lurker",
    postsILike: "Ten years of reading, first time funding.",
  },
  {
    handle: "gdocleaker",
    displayName: "Google Doc Liberator",
    postsILike: "Your private google docs deserve to be blog posts.",
  },
  {
    handle: "compoundreader",
    displayName: "Compound Reader",
    postsILike: "Essays on ambition, compounding, and doing fewer things.",
  },
  {
    handle: "sleepless",
    displayName: "Sleepless in SF",
    postsILike: "Contrarian literature reviews with receipts.",
  },
  {
    handle: "stickfig",
    displayName: "Stick Figure Fan",
    postsILike: "20,000 words and a drawing of a scared mammoth.",
  },
  {
    handle: "inkdrop",
    displayName: "Inkdrop",
    postsILike: "Careful alignment writing for careful outsiders.",
  },
  {
    handle: "hivemind",
    displayName: "Constellation Hivemind",
    postsILike: "The google-doc meta, but public.",
  },
  {
    handle: "paintwatcher",
    displayName: "Paint Watcher",
    postsILike: "Watching paint dry, as long as Scott's the one describing it.",
  },
];

const bloggers: SeedBlogger[] = [
  {
    slug: "holden-karnofsky",
    name: "Holden Karnofsky",
    blogName: "Cold Takes",
    blogUrl: "https://www.cold-takes.com",
    daysSilent: 412,
    epitaph: "Rumors of a most important century persist.",
    recentPosts: [
      {
        title: "The Most Important Century (series)",
        url: "https://www.cold-takes.com/most-important-century/",
        date: "2021",
      },
      {
        title: "Learning By Writing",
        url: "https://www.cold-takes.com/learning-by-writing/",
        date: "2022",
      },
    ],
    pledges: [
      [25000, "austin", "Cold Takes taught me how to reason in public."],
      [10000, "carol"],
      [5000, "earlyreader"],
      [3000, "sqrtfan", "One more nutshell, please."],
      [2500, "quietlurker"],
      [2000, "compoundreader"],
      [1500, "inkdrop"],
      [1000, "paintwatcher"],
    ],
  },
  {
    slug: "paul-christiano",
    name: "Paul Christiano",
    blogName: "The Sideways View",
    blogUrl: "https://sideways-view.com",
    daysSilent: 1533,
    epitaph: "Aligned, but not posting.",
    recentPosts: [
      {
        title: "Takeoff speeds",
        url: "https://sideways-view.com/2018/02/24/takeoff-speeds/",
        date: "2018",
      },
      {
        title: "Hyperbolic growth",
        url: "https://sideways-view.com/2017/10/04/hyperbolic-growth/",
        date: "2017",
      },
    ],
    pledges: [
      [20000, "carol", "Made alignment arguments you could actually check."],
      [5000, "austin"],
      [3000, "inkdrop"],
      [2500, "earlyreader"],
      [2000, "quietlurker"],
      [1500, "sqrtfan"],
      [1000, "paintwatcher"],
    ],
  },
  {
    slug: "sam-altman",
    name: "Sam Altman",
    blogUrl: "https://blog.samaltman.com",
    daysSilent: 412,
    epitaph: "Linkposts don't count.",
    recentPosts: [
      {
        title: "How To Be Successful",
        url: "https://blog.samaltman.com/how-to-be-successful",
        date: "2019",
      },
      {
        title: "What I Wish Someone Had Told Me",
        url: "https://blog.samaltman.com/what-i-wish-someone-had-told-me",
        date: "2023",
      },
    ],
    pledges: [
      [3000, "compoundreader", "The bounty is for the essay voice, not a press release."],
      [2500, "earlyreader"],
      [2000, "sqrtfan"],
      [1500, "sleepless"],
      [1500, "quietlurker"],
      [1000, "gdocleaker"],
      [1000, "hivemind"],
      [5000, "austin"],
    ],
  },
  {
    slug: "wait-but-why",
    name: "Wait But Why",
    blogName: "Wait But Why",
    blogUrl: "https://waitbutwhy.com",
    daysSilent: 1204,
    epitaph: "Survived by several thousand stick figures.",
    recentPosts: [
      {
        title: "The AI Revolution: The Road to Superintelligence",
        url: "https://waitbutwhy.com/2015/01/artificial-intelligence-revolution-1.html",
        date: "2015",
      },
      {
        title: "Why Procrastinators Procrastinate",
        url: "https://waitbutwhy.com/2013/10/why-procrastinators-procrastinate.html",
        date: "2013",
      },
    ],
    pledges: [
      [3000, "stickfig", "One more stick figure epic."],
      [2500, "earlyreader"],
      [2000, "gdocleaker"],
      [2000, "sqrtfan"],
      [1500, "quietlurker"],
      [1500, "sleepless"],
      [1000, "hivemind"],
      [1000, "compoundreader"],
    ],
  },
  {
    slug: "dwarkesh-patel",
    name: "Dwarkesh Patel",
    blogName: "The Lunar Society",
    blogUrl: "https://www.dwarkesh.com",
    daysSilent: 174,
    epitaph: "Bounty: finish the Classical Liberal AGI series.",
    recentPosts: [
      {
        title: "Will scaling work?",
        url: "https://www.dwarkesh.com/p/will-scaling-work",
        date: "2023",
      },
    ],
    pledges: [
      [25000, "austin", "Commissioned: the rest of Classical Liberal AGI."],
      [2500, "compoundreader"],
      [2000, "earlyreader"],
      [1500, "hivemind"],
      [1000, "sqrtfan"],
    ],
  },
  {
    slug: "joe-carlsmith",
    name: "Joe Carlsmith",
    blogUrl: "https://joecarlsmith.com",
    daysSilent: 267,
    epitaph: "Otherness, and the silence of it.",
    recentPosts: [
      {
        title: "Otherness and control in the age of AGI (series)",
        url: "https://joecarlsmith.com/2024/01/02/otherness-and-control-in-the-age-of-agi",
        date: "2024",
      },
    ],
    pledges: [
      [15000, "carol"],
      [2500, "inkdrop"],
      [2000, "quietlurker", "Essays that read like prayers. More."],
      [1500, "earlyreader"],
      [1000, "paintwatcher"],
    ],
  },
  {
    slug: "applied-divinity-studies",
    name: "Applied Divinity Studies",
    pseudonymous: true,
    blogName: "Applied Divinity Studies",
    blogUrl: "https://applieddivinitystudies.com",
    daysSilent: 986,
    epitaph: "Identity unknown. Sorely missed.",
    recentPosts: [
      {
        title: "Archive",
        url: "https://applieddivinitystudies.com/archive/",
        date: "2020–2023",
      },
    ],
    pledges: [
      [5000, "austin"],
      [4000, "carol"],
      [1500, "earlyreader", "Pseudonymous, prolific, gone."],
      [1500, "sqrtfan"],
      [1000, "quietlurker"],
      [1000, "gdocleaker"],
      [1000, "sleepless"],
      [1000, "hivemind"],
      [500, "stickfig"],
      [500, "paintwatcher"],
    ],
  },
  {
    slug: "nate-soares",
    name: "Nate Soares",
    blogName: "Minding Our Way",
    blogUrl: "https://mindingourway.com",
    daysSilent: 1102,
    epitaph: "Resting in his own way.",
    recentPosts: [
      {
        title: "On caring",
        url: "https://mindingourway.com/on-caring/",
        date: "2014",
      },
      {
        title: "Rest in motion",
        url: "https://mindingourway.com/rest-in-motion/",
        date: "2015",
      },
    ],
    pledges: [
      [20000, "carol", "The guilt series got me through grad school."],
      [2000, "inkdrop"],
      [1500, "quietlurker"],
      [1000, "earlyreader"],
    ],
  },
  {
    slug: "alexey-guzey",
    name: "Alexey Guzey",
    blogUrl: "https://guzey.com",
    daysSilent: 731,
    epitaph: "Asked why we sleep. Then showed us.",
    recentPosts: [
      {
        title: "Theses on Sleep",
        url: "https://guzey.com/theses-on-sleep/",
        date: "2021",
      },
      {
        title: "Matthew Walker's 'Why We Sleep' Is Riddled with Scientific and Factual Errors",
        url: "https://guzey.com/books/why-we-sleep/",
        date: "2019",
      },
    ],
    pledges: [
      [12000, "austin"],
      [2000, "sleepless"],
      [1500, "sqrtfan"],
      [1000, "gdocleaker"],
      [1000, "hivemind"],
    ],
  },
  {
    slug: "kipply",
    name: "Kipply",
    blogName: "kipply's blog",
    blogUrl: "https://kipp.ly",
    daysSilent: 858,
    epitaph: "The inference costs were too high.",
    recentPosts: [
      {
        title: "Transformer Inference Arithmetic",
        url: "https://kipp.ly/transformer-inference-arithmetic/",
        date: "2022",
      },
    ],
    pledges: [
      [10000, "austin"],
      [1500, "sqrtfan"],
      [1000, "earlyreader"],
      [1000, "compoundreader"],
    ],
  },
  {
    slug: "ben-kuhn",
    name: "Ben Kuhn",
    blogUrl: "https://www.benkuhn.net",
    daysSilent: 389,
    epitaph: "Went off to be essential infrastructure.",
    recentPosts: [
      {
        title: "To listen well, get curious",
        url: "https://www.benkuhn.net/listen/",
        date: "2020",
      },
      {
        title: "In defense of blub studies",
        url: "https://www.benkuhn.net/blub/",
        date: "2020",
      },
    ],
    pledges: [
      [8000, "austin"],
      [1500, "quietlurker"],
      [1000, "earlyreader"],
      [1000, "compoundreader"],
    ],
  },
  {
    slug: "tristan-hume",
    name: "Tristan Hume",
    blogUrl: "https://thume.ca",
    daysSilent: 644,
    epitaph: "Profiled everything except his absence.",
    recentPosts: [
      {
        title: "Blog archive",
        url: "https://thume.ca/archive.html",
        date: "2014–2023",
      },
    ],
    pledges: [
      [7000, "austin"],
      [1000, "sqrtfan"],
      [1000, "gdocleaker"],
    ],
  },
  {
    slug: "nintil",
    name: "Nintil",
    pseudonymous: false,
    blogName: "Nintil (José Luis Ricón)",
    blogUrl: "https://nintil.com",
    daysSilent: 534,
    epitaph: "A single personal bounty from Carol's discretionary pot.",
    recentPosts: [
      {
        title: "Longevity FAQ",
        url: "https://nintil.com/longevity",
        date: "2019",
      },
    ],
    pledges: [[100000, "carol", "Personal bounty — goes live immediately."]],
  },
  {
    slug: "jacob-trefethen",
    name: "Jacob Trefethen",
    blogUrl: "https://jacobtrefethen.com",
    daysSilent: 892,
    epitaph: "Maybe blogged his way into being too busy to blog.",
    recentPosts: [
      {
        title: "Blog",
        url: "https://jacobtrefethen.com",
        date: "2021–2023",
      },
    ],
    pledges: [
      [10000, "austin", "Science funding needs its bard back."],
      [1000, "hivemind"],
      [500, "earlyreader"],
    ],
  },
  {
    slug: "the-last-psychiatrist",
    name: "The Last Psychiatrist",
    pseudonymous: true,
    blogUrl: "https://thelastpsychiatrist.com",
    daysSilent: 4088,
    epitaph: "If you're reading this bounty, it's for you.",
    recentPosts: [
      {
        title: "Archives",
        url: "https://thelastpsychiatrist.com/archives.html",
        date: "2005–2014",
      },
    ],
    pledges: [
      [2500, "quietlurker", "Eleven years. We're still here."],
      [2000, "gdocleaker"],
      [1500, "sleepless"],
      [1000, "paintwatcher"],
      [1000, "stickfig"],
    ],
  },
];

const comments: { blogger: string; patron: string; text: string }[] = [
  {
    blogger: "holden-karnofsky",
    patron: "austin",
    text: "Cold Takes is the reason I think in centuries now. The nutshell posts were the best onboarding to worldview-building anyone has written.",
  },
  {
    blogger: "holden-karnofsky",
    patron: "earlyreader",
    text: "I re-read Learning By Writing every time I get stuck. Would happily fund a post about what changed since joining a lab.",
  },
  {
    blogger: "paul-christiano",
    patron: "carol",
    text: "Takeoff speeds is still the post I send people who want the real arguments. A 2026 update would be priceless.",
  },
  {
    blogger: "alexey-guzey",
    patron: "gdocleaker",
    text: "The Why We Sleep takedown is the canonical example of a blog post doing what institutions couldn't.",
  },
  {
    blogger: "nate-soares",
    patron: "carol",
    text: "Minding Our Way quietly fixed how a whole community relates to guilt. One more post on rest, please.",
  },
  {
    blogger: "wait-but-why",
    patron: "sqrtfan",
    text: "Nobody else can make me read 20,000 words about anything. That's the skill we're bountying.",
  },
];

async function main() {
  const txs: any[] = [];

  // Settings singleton
  const settingsId = id();
  txs.push(
    db.tx.settings[settingsId].update({
      key: "main",
      matchingPoolCents: 10_000_00,
      liveThresholdCents: 1_000_00,
    }),
  );

  // Patrons
  const patronIds = new Map<string, string>();
  for (const p of patrons) {
    const pid = id();
    patronIds.set(p.handle, pid);
    txs.push(
      db.tx.profiles[pid].update({
        handle: p.handle,
        displayName: p.displayName,
        bio: p.bio,
        postsILike: p.postsILike,
        favoriteAliveBlogs: p.favoriteAliveBlogs,
        favoriteDeadBlogs: p.favoriteDeadBlogs,
        createdAt: now,
      }),
    );
  }

  // Bloggers + pledges
  const bloggerIds = new Map<string, string>();
  for (const b of bloggers) {
    const bid = id();
    bloggerIds.set(b.slug, bid);
    txs.push(
      db.tx.bloggers[bid].update({
        slug: b.slug,
        name: b.name,
        pseudonymous: b.pseudonymous ?? false,
        blogName: b.blogName,
        blogUrl: b.blogUrl,
        epitaph: b.epitaph,
        lastPostAt: now - b.daysSilent * DAY,
        recentPosts: b.recentPosts,
        status: "funding",
        createdAt: now,
      }),
    );
    for (const [amountCents, patronHandle, note] of b.pledges) {
      const source =
        patronHandle === "austin" || patronHandle === "carol" ? patronHandle : "patron";
      txs.push(
        db.tx.pledges[id()]
          .update({
            amountCents,
            note,
            source,
            status: "paid",
            createdAt: now - Math.floor(Math.random() * 20) * DAY,
          })
          .link({ patron: patronIds.get(patronHandle)!, blogger: bid }),
      );
    }
  }

  // Comments
  for (const c of comments) {
    txs.push(
      db.tx.comments[id()]
        .update({ text: c.text, createdAt: now - Math.floor(Math.random() * 15) * DAY })
        .link({
          author: patronIds.get(c.patron)!,
          blogger: bloggerIds.get(c.blogger)!,
        }),
    );
  }

  await db.transact(txs);
  console.log(`Seeded ${bloggers.length} bloggers, ${patrons.length} patrons, pledges + comments.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
