# Spec

Create the website for "Blog Revival Project", a new platform which coordinates bounties for great bloggers to post a new article.

Motivation: bloggers like Holden Karnofsky, Sam Altman, and Paul Christiano have greatly informed our own thinking; but many have stopped writing.

Mechanism: we're using quadratic funding, initially with a $10k matching pool. Austin and Carol (Manifund employees) are also each distributing $5k in personal bounties. By default, bounties are live once they've hit $1k in total commitments (across direct commitments + matching pool)

- Homepage should explain the concept and list the top live bounties
- Blogger profiles should be a straightforward page with their name (possibly pseudonymous), link to blog, link to recent (substantive) posts, and time since last post. A photo if we have it.
- Patrons can sign up, deposit funding via credit card, comment on specific blogs/why they liked them. They should also have a profile, where they can list their favorite favorite alive and favorite dead blogs, and also write a section on "what kind of posts they like"
- There should be a live demo slider to help people understand quadratic funding math by showing how much a donation will be matched.
- Bloggers can sign up to claim their profile, post a link to the published blog, and (upon verification) withdraw their bounty via Stripe Connect
  - Or: direct their bounty to revive another blogger; or donate it to a charity
- A user can be both patron & blogger
- Tech stack: NextJS/Tailwind frontend, InstantDB backend, Stripe Connect for payments & payouts
- This is a project of Manifund 501c3, so patron bounties are tax-deductible per US law

Build a shared backend and two demo frontends, one under /graveyard, one under /wordpress, inspired by the two html designs that live in /prototypes

# More context

_A lot of great bloggers have stopped blogging. Let’s offer them bounties to start again!_

straw proposal: $1000 for 1000 words for a list of bloggers we like; extension: kickstarter-like crowdfunding, with quadratic funding matching pool

### Theses

1. Much important context is locked in the brains of people “too busy to write”
2. Substack is great, but the core platform economics reward frequent posting to build an audience
3. The marginal 1k words from someone doing good work who rarely blogs >> marginal 1k words from a daily substacker (even a very good substacker)
   1. cf Scott Alexander on “watching paint dry”
4. Many great blogs are victims of their own success
   1. Eg maybe Jacob Trefethen blogged his way into running OAI Foundation life sciences
   2. <example of blogger becoming CEO>

### Bloggers we’d bounty

- Austin:
  - Historical bloggers I’ve learned a lot from
    - Holden Karnofsky
    - Joe Carlsmith
    - Ben Kuhn
    - Applied Divinity Studies
    - Alexey Guzey
    - Jacob Trefethen
    - Janus ?
    - Paul Christiano
    - Dwarkesh
    - Wait But Why
  - Very famous/busy people who maybe used to write
    - Sam Altman
    - Demis Hassabis
    - Leopold Aschenbrenner
  - People I know (at least a bit) and like who seem too busy to write now
    - Alex Gajewski
    - Paul Gu
    - Venki Kumar
    - Kipply
    - Tristan Hume
    - Keri Warr
    - Anthony Giovannetti
    - Vishal Maini
    - Ross Rheingans-Yoo
    - Leila Clark
  - people who know stuff relevant to Manifund
    - <cg/longview grantmakers>
    - <founders/YC partner types, for surplus>
    - <potential donors at Anthropic>
    - <OAIF people>
- Carol:
  - Leopold
  - Carl Shulman
  - Nick Beckstead
  - Paul Christiano
  - Holden Karnofsky
    - has written about Anthropic RSP
  - Nate Soares
    - has written stuff about alignment though I’m thinking of https://mindingourway.com/
  - Adam Yedidia
  - Ari Shalunov

- other places to get ideas:
  - LessOnline list, Manifest list

### People who might like this project

- writers
  - Jasmine Sun — thinking about doing longform
  - Jose Luis Ricon
  - Vitalik? if we do QF esp
- patrons
  - ??? anthropic people?
  - Chris Best?
- others
  - The Lesswrong/Lightcone people

### Musings

- [ac] not sure how core “haven’t blogged in a year” is
  - some are people who kind of/technically have recently blogged, but I’d still love to get more from
- some arbitrariness around “what counts as having blogged”
  - eg Sam Altman’s two latest posts:
    - https://blog.samaltman.com/2279512 in response to molotov — kind of, maybe, feels a bit on the line somehow
    - https://blog.samaltman.com/sora-update-number-1 — probably shouldn’t count, too business-y
  - linkposts maybe don’t count?
- sometimes i kind of want to commission an article instead
  - eg “I want Dwarkesh to finish his series on Classical Liberal AGI”
  - [c] allow people to comment w/ what they want
- [c] sometimes people send me basically blog emails
- “personal blogs we like” to frame it
- [ac] people often send me google docs which could just be blogs
  - “google doc meta” inside AIS hivemind/Constellation

maybe feature: patrons write about what they’re excited to see. “inverse substack”

- writing about job vs writing personal
- writing professional vs unfiltered

“favorite dead bloggers” and “favorite live bloggers”

commitment mechanism thoughts

- return to patron after 1mo?
  - could be gimmicky with timer
- can patrons withdraw a commitment? [c] instinct no, don’t want someone to write a blog post
- hits 1000 (direct + matching) ⇒ live
  - match may fluctuate after, but direct is fixed
  - when blogger claims, match is immediately taken out of matching pool

### design musings

- could lean a lot into alive vs dead, cemetery theme for the dead bloggers

### Names

- Blog Revival Project
  - “**revive.blog**” is available, also “revival.blog”
- Kickstarter for blogs

“patron” vs “reader”

“blogger” vs “writer”

### Quadratic funding notes

- https://forum.effectivealtruism.org/posts/GgYfqrATFzLAaPdct/announcing-the-usd200k-ea-community-choice
- (unreleased) Community Choice Retro
- https://vitalik.eth.limo/general/2019/12/07/quadratic.html
