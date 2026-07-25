// Launch post + FAQ copy, shared by both skins (graveyard & WordPress).
// Inline links use markdown [text](url) syntax; render via linkify().
// Answers are arrays of paragraphs.

export const LAUNCH_PARAGRAPHS: string[] = [
  "Blogs have shaped our philosophical worldviews, found us careers and friends, and changed our lives. There’s a good chance that a great blog of yore is the reason you’re reading this right now.",
  "But many great bloggers have stopped blogging. The pile-on dynamics of the internet discourage unfiltered thoughts, and algorithmic feeds amplify [ragebait](https://slatestarcodex.com/2014/12/17/the-toxoplasma-of-rage/) and slop. Fear of scrutiny leads people to confine things to private Google docs and group chats. And good blogs are often victims of their own success—someone with a lot of good thoughts is at risk of becoming an adult with a demanding job and not that much free time.",
  "It’s not all bad. Substack has led to a renaissance of email newsletters, and our friends at [Inkhaven](https://www.inkhaven.blog/) host a bootcamp for bloggers. These are awesome, but they structurally encourage posting every day. We’d rather read the marginal post from an accomplished but erstwhile blogger, than one from a daily Substacker — even if the latter is a better writer!",
  "So we’re launching the Blog Revival Project, to crowdfund $1,000+ bounties for good bloggers.",
  "Sign up and pledge money towards reviving your favorite defunct blog! Or (though we kind of designed the website around a resurrection theme) feel free to nominate someone who hasn’t blogged in the past but who you think really should.",
  "We’re seeding this with $8,000 of our own pledges and a $10,000 quadratic match pool. [Quadratic funding](https://vitalik.eth.limo/general/2019/12/07/quadratic.html) is the theoretically optimal way to fund public goods; many small pledges beat one big one. And we’re offering a bonus to our first 100 patrons: they’ll each get $25 to allocate to whatever bloggers they want.",
];

export const LAUNCH_SIGNATURE = "— Carol and Austin, from Manifund";

export type FaqItem = { q: string; a: string[] };
// A section with no title runs straight into the page's own "FAQ" heading.
export type FaqSection = { title?: string; items: FaqItem[] };

export const FAQ_SECTIONS: FaqSection[] = [
  {
    items: [
      {
        q: "Will $1,000 really get Sam Altman or Holden Karnofsky to blog again?",
        a: [
          "Probably not, but [money is the unit of caring](https://www.lesswrong.com/posts/ZpDnRCeef2CLEFeKM/money-the-unit-of-caring) and we want to express our caringness concretely. We’re hoping that at least some bloggers will enjoy the challenge we pose, and buy themselves a nice meal with the proceeds.",
          "Also, social pressure! We suggest that patrons leave a message of encouragement, sharing what specific blogs have meant to them.",
        ],
      },
      {
        q: "Who can I nominate? What counts as defunct?",
        a: [
          "Approximately, “posting nowhere near the frequency that they used to.” Silence for a year would be an easy yes.",
        ],
      },
      {
        q: "What counts as a blog post?",
        a: [
          "We’re thinking of things written in a personal tone, at least medium length eg 1000+ words. Linkposts or launch posts (usually) don’t count. [We’ll know it when we see it](https://en.wikipedia.org/wiki/I_know_it_when_I_see_it).",
        ],
      },
      {
        q: "Why quadratic funding?",
        a: [
          "Yeah, it’s a bit overcomplicated, but we at Manifund are nothing if not mechanism design nerds. (Wait til we bust out the prediction markets and impact certs...)",
        ],
      },
      {
        q: "Do I have to make a donation to claim the $25 credit?",
        a: [
          "No! In fact we haven’t even hooked up Stripe to accept donations yet; we’ll do that once people start asking to contribute real money.",
        ],
      },
    ],
  },
  {
    title: "For Bloggers",
    items: [
      {
        q: "How do I claim my money?",
        a: [
          "Go to [https://revive.blog/claim](https://revive.blog/claim) to claim your profile. After you’ve published a new post, email us ([carol@manifund.org](mailto:carol@manifund.org)) and we’ll figure out payment logistics; most likely a direct bank payment via ACH or wire.",
        ],
      },
      {
        q: "What are the terms?",
        a: [
          "We ask that you publish your post unpaywalled, and allow us to link to or mirror it. We’ll attribute you, of course! It’d be nice if you want to credit your patrons and/or The Blog Revival Project, but that’s not required.",
        ],
      },
      {
        q: "What if accepting money is complicated for tax/visa/etc reasons?",
        a: [
          "You can pay it forward by pledging towards another defunct blogger!",
          "You can also ask us to contribute it to any Manifund project, or any other 501c3 charity.",
        ],
      },
    ],
  },
];

export const FAQ_FOOTER =
  "More questions? Jump in [our Discord](https://discord.com/invite/ZGsDMWSA5Q) or email [carol@manifund.org](mailto:carol@manifund.org).";
