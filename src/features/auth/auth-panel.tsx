"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const google = async () => {
    try { await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback` } }); }
    catch { setMessage("Connect Supabase to enable sign-in."); }
  };
  const magicLink = async (event: FormEvent) => {
    event.preventDefault();
    try { const { error } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback` } }); if (error) throw error; setMessage("Check your email for a sign-in link."); }
    catch { setMessage("Connect Supabase to enable email sign-in."); }
  };
  return <aside className="auth-panel" aria-label="Sign in to save"><h2>Save this search</h2><p>Sign in only when you want to keep it.</p><button type="button" onClick={google}>Continue with Google</button><form onSubmit={magicLink}><label htmlFor="email">Email</label><input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /><button type="submit">Email me a sign-in link</button></form>{message ? <p role="status">{message}</p> : null}</aside>;
}
