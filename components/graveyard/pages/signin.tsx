"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/db";
import { useGoogleAuthUrl } from "@/lib/hooks";

function SignInInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";
  // Instant appends ?error= when the OAuth redirect fails.
  const oauthError = searchParams.get("error");
  const googleUrl = useGoogleAuthUrl();
  const { user } = db.useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Covers the return leg of the OAuth redirect (Instant signs the user in
  // automatically) and anyone visiting /signin while already signed in.
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

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
      {stage === "code" && (
        <p className="mt-4 text-moon/80">
          We sent a code to {email}. Enter it below.
        </p>
      )}
      {stage === "email" && (
        <>
          <a
            href={googleUrl || undefined}
            aria-disabled={!googleUrl}
            className="gy-caps mt-8 block w-full rounded-sm border border-candle/60 px-6 py-3 font-medium text-candle hover:bg-candle/10 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            continue with google
          </a>
          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-moon/15" />
            <span className="gy-label text-mist">or by email</span>
            <span className="h-px flex-1 bg-moon/15" />
          </div>
        </>
      )}
      <form
        className="mt-6 space-y-4"
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
      {(error ?? oauthError) && (
        <p className="mt-4 text-sm text-red-300">{error ?? oauthError}</p>
      )}
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
