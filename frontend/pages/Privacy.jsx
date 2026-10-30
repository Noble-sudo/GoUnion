import React from "react";
import { Link } from "react-router-dom";

const UPDATED = "30 October 2026";
const EMAIL = "ncpojimadu@gmail.com";

const SECTIONS = [
  {
    h: "Who we are",
    p: [
      "VeeCity is a campus social app for university students in Nigeria. It includes Konnect (posts, reels, groups, messages and stories) and Teaky (a marketplace where students open shops and sell items to each other). VeeCity is built and run by NobCyborg, Nigeria.",
      "This policy explains what information we collect, why we collect it, and the choices you have. By using VeeCity you agree to this policy.",
    ],
  },
  {
    h: "Information we collect",
    list: [
      "Account details: your username, email address and a password (stored in scrambled, hashed form, never as plain text).",
      "Profile details: your name, bio, profile photo, school or institution, and any details you choose to add.",
      "Student verification details: information you give us so we can confirm you are a student of your institution.",
      "Content you create: posts, reels, photos, videos, comments, stories, group activity, messages, and shop and product listings (including photos, prices and contact details you add to a shop).",
      "Photos, camera and microphone: the app asks for permission to use your camera, microphone and photos only when you choose to take or upload a photo, video or reel. We do not use them in the background.",
      "Activity and settings: who you follow, likes, post views, notification and privacy settings, and your online or last-seen status (you can hide these in Settings).",
      "Device and notification data: a push notification token if you allow notifications, so we can alert you about messages, follows and activity.",
      "Reports: if you report a post, comment, user or shop, we keep the report and the reason you gave.",
    ],
  },
  {
    h: "How we use your information",
    list: [
      "To create and run your account and let you sign in.",
      "To show your posts, reels, messages and shops to the people you choose to share them with.",
      "To send you notifications and account emails (such as email confirmation and password reset).",
      "To keep the community safe: reviewing reports, removing harmful content, and suspending accounts that break our rules.",
      "To fix problems and improve the app.",
    ],
    p: ["We do not sell your personal information. We do not show third-party ads in the app."],
  },
  {
    h: "Who can see your information",
    p: [
      "Your username, profile and public posts can be seen by other VeeCity users. Messages are visible to the people in the conversation. If you turn on a private account or change your privacy settings, your content is shared accordingly.",
      "Shops on Teaky are public so buyers can find them. VeeCity does not process payments for items on Teaky. Buyers and sellers deal with each other directly, so please be careful and read the safety tips in the app.",
    ],
  },
  {
    h: "Services we use",
    p: ["To run VeeCity we use trusted service providers who process data for us:"],
    list: [
      "Hosting and database providers (for our servers and stored data).",
      "A media storage service (for photos, videos and files you upload).",
      "An email delivery service (to send account emails).",
      "Audius, a music streaming service, when you add or play music on a post or reel.",
    ],
  },
  {
    h: "How long we keep your information",
    p: [
      "We keep your information while your account is active. When you ask us to delete your account, we delete your account and personal information within 30 days, except where we must keep something to meet legal duties or to deal with abuse or safety issues.",
    ],
  },
  {
    h: "Your choices and deleting your account",
    list: [
      "You can edit your profile and change your privacy and notification settings in the app.",
      "You can delete your own posts and comments.",
      "You can ask us to delete your account and your data at any time. Email " + EMAIL + " from the email address on your account with the subject Delete my VeeCity account. We will confirm and complete it within 30 days.",
      "You can also ask for a copy of your information or ask us to correct it, using the same email.",
    ],
  },
  {
    h: "Security",
    p: [
      "We protect your data with encrypted connections (HTTPS) and hashed passwords. No system is completely secure, so please use a strong password and do not share it.",
    ],
  },
  {
    h: "Children",
    p: [
      "VeeCity is for university students and is not meant for anyone under 16. If we learn that a child under 16 has an account, we will delete it. If you think this has happened, contact us.",
    ],
  },
  {
    h: "Changes to this policy",
    p: [
      "We may update this policy from time to time. When we do, we will change the date at the top of this page. If the changes are important, we will tell you in the app.",
    ],
  },
  {
    h: "Contact us",
    p: ["Questions or requests about your privacy? Email " + EMAIL + "."],
  },
];

export const Privacy = () => (
  <div className="min-h-screen w-full bg-[#050505] text-zinc-300">
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Link to="/" className="text-xs font-bold uppercase tracking-widest text-blue-400">&larr; Back to VeeCity</Link>
      <h1 className="mt-6 text-4xl font-black tracking-tight text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-zinc-500">VeeCity (Konnect and Teaky) &middot; Last updated {UPDATED}</p>
      {SECTIONS.map((s) => (
        <section key={s.h} className="mt-8">
          <h2 className="text-lg font-black text-white">{s.h}</h2>
          {(s.p || []).map((t, i) => (
            <p key={i} className="mt-3 text-sm leading-relaxed text-zinc-400">{t}</p>
          ))}
          {s.list && (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-400">
              {s.list.map((t, i) => (<li key={i}>{t}</li>))}
            </ul>
          )}
        </section>
      ))}
    </div>
  </div>
);
