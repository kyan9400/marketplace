"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");

  return (
    <section className="section">
      <div className="mx-auto max-w-md card p-6 md:p-8">
        <h1 className="mb-2">Welcome back</h1>
        <p className="text-gray-600 mb-6">Use your email to sign in (dev credentials).</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await signIn("credentials", { email, callbackUrl: "/account" });
          }}
          className="space-y-3"
        >
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />
          <button className="btn-primary w-full" type="submit">Sign in</button>
        </form>
      </div>
    </section>
  );
}
