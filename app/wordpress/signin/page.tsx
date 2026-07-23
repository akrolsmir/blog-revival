"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/db";

function SignInInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/wordpress/account";
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
    <div className="mx-auto max-w-sm">
      <h2 className="text-[22px] font-bold">Sign in</h2>
      {stage === "code" && (
        <p className="wp-meta mt-1">Code sent to {email}.</p>
      )}
      <form
        className="mt-4 space-y-3"
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
            className="w-full"
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
            className="w-full text-center text-lg tracking-[0.3em]"
          />
        )}
        <button type="submit" disabled={busy} className="w-full">
          {busy ? "…" : stage === "email" ? "Send login code" : "Log in →"}
        </button>
      </form>
      {error && <p className="mt-3 text-[12.5px] text-red-700">{error}</p>}
      {stage === "code" && (
        <button
          type="button"
          onClick={() => setStage("email")}
          className="!mt-4 !border-0 !bg-none !bg-transparent !p-0 !font-normal !text-wplink underline"
        >
          use a different email
        </button>
      )}
    </div>
  );
}

export default function WpSignInPage() {
  return (
    <Suspense>
      <SignInInner />
    </Suspense>
  );
}
