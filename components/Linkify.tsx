import Link from "next/link";
import type { ReactNode } from "react";

// Render a plain string with inline links. Supports markdown [text](url)
// links as well as bare URLs and email addresses. revive.blog links become
// internal <Link>s; emails render as plain (unstyled) mailto links; other
// links get `linkClass` so each skin can match its palette.
const TOKEN = /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s)]+)|([\w.+-]+@[\w.-]+\.\w{2,})/g;

function renderLink(label: string, url: string, key: number, linkClass?: string): ReactNode {
  const isEmail = url.startsWith("mailto:") || /^[\w.+-]+@[\w.-]+\.\w{2,}$/.test(url);
  if (isEmail) {
    const href = url.startsWith("mailto:") ? url : `mailto:${url}`;
    // Email stays plain — no accent color or underline.
    return (
      <a key={key} href={href} className="!text-inherit !no-underline">
        {label}
      </a>
    );
  }
  const internal = url.replace(/^https?:\/\/(www\.)?revive\.blog/, "");
  if (internal !== url) {
    return (
      <Link key={key} href={internal || "/"} className={linkClass}>
        {label}
      </Link>
    );
  }
  return (
    <a key={key} href={url} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {label}
    </a>
  );
}

export function linkify(text: string, linkClass?: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const [full, mdText, mdUrl, bareUrl, bareEmail] = m;
    if (mdText != null && mdUrl != null) {
      nodes.push(renderLink(mdText, mdUrl, key++, linkClass));
    } else if (bareUrl) {
      nodes.push(renderLink(bareUrl, bareUrl, key++, linkClass));
    } else if (bareEmail) {
      nodes.push(renderLink(bareEmail, bareEmail, key++, linkClass));
    }
    last = m.index + full.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
