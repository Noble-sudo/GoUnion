import React from "react";
import { Link } from "react-router-dom";

const EMAIL = "ncpojimadu@gmail.com";

const STEPS = [
  "Send an email to " + EMAIL + " from the email address you used to sign up for VeeCity.",
  "Use the subject: Delete my VeeCity account.",
  "In the email, write your VeeCity username and say you want your account and data deleted.",
  "We will reply to confirm it is you, then delete your account. This is completed within 30 days.",
];

const DELETED = [
  "Your account (username, email address and password).",
  "Your profile (name, bio, photo, school details and verification information).",
  "Your posts, reels, stories, comments, likes and messages.",
  "Your groups activity, followers and following.",
  "Any Teaky shop and product listings you created.",
  "Your notification settings and push notification token.",
];

const KEPT = [
  "Reports and moderation records about rule-breaking, if we need them to keep the community safe or to follow the law. These are kept for up to 12 months.",
  "Anything we are legally required to keep.",
];

export const DeleteAccount = () => (
  <div className="min-h-screen w-full bg-[#050505] text-zinc-300">
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Link to="/" className="text-xs font-bold uppercase tracking-widest text-blue-400">&larr; Back to VeeCity</Link>
      <h1 className="mt-6 text-4xl font-black tracking-tight text-white">Delete your VeeCity account</h1>
      <p className="mt-2 text-sm text-zinc-500">VeeCity (Konnect and Teaky) by NobCyborg</p>

      <section className="mt-8">
        <h2 className="text-lg font-black text-white">How to request deletion</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-400">
          {STEPS.map((t, i) => (<li key={i}>{t}</li>))}
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-black text-white">What we delete</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-400">
          {DELETED.map((t, i) => (<li key={i}>{t}</li>))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-black text-white">What we may keep, and for how long</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-400">
          {KEPT.map((t, i) => (<li key={i}>{t}</li>))}
        </ul>
      </section>

      <p className="mt-8 text-sm leading-relaxed text-zinc-400">
        You can read how we handle your information in our <Link to="/privacy" className="text-blue-400 underline">Privacy Policy</Link>.
      </p>
    </div>
  </div>
);
