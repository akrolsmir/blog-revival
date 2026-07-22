"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/db";

function SignInInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/graveyard/account";
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    setBusy(true);
    setError(null);
    try {
      await db.auth.sendMagicCode({ email });
      setStage("code");
    } catch (e: any) {
      setError(e?.body?.message ?? "Couldn't send the code. Check the email.");
    }
    setBusy(false);
  }

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      await db.auth.signInWithMagicCode({ email, code });
      router.push(next);
    } catch (e: any) {
      setError(e?.body?.message ?? "That code didn't match. Try again.");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-20 text-center">
      <p className="gy-label text-mist">the veil is thin</p>
      <h1 className="mt-3 text-4xl">Sign in</h1>
      <p className="mt-4 text-moon/80">
        {stage === "email"
          ? "We'll email you a six-digit code. No passwords in the afterlife."
          : `We sent a code to ${email}. Enter it below.`}
      </p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          stage === "email" ? sendCode() : verify();
        }}
      >
        {stage === "email" ? (
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-sm border border-moon/25 bg-transparent px-4 py-3 text-center text-moon placeholder:text-mist/60"
          />
        ) : (
          <input
            type="text"
            required
            autoFocus
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="w-full rounded-sm border border-moon/25 bg-transparent px-4 py-3 text-center text-2xl tracking-[0.4em] text-moon placeholder:text-mist/40"
          />
        )}
        <button
          type="submit"
          disabled={busy}
          className="gy-caps w-full rounded-sm bg-candle px-6 py-3 font-medium text-night hover:bg-candle/90 disabled:opacity-50"
        >
          {busy ? "…" : stage === "email" ? "send the code" : "cross over"}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      {stage === "code" && (
        <button
          type="button"
          onClick={() => setStage("email")}
          className="gy-label mt-6 text-mist underline underline-offset-4"
        >
          use a different email
        </button>
      )}
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInInner />
    </Suspense>
  );
}
