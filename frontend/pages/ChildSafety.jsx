import React from "react";
import { Link } from "react-router-dom";

const EMAIL = "ncpojimadu@gmail.com";
const UPDATED = "2 November 2026";

const SECTIONS = [
  {
    title: "Our position",
    items: [
      "VeeCity has zero tolerance for child sexual abuse and exploitation (CSAE), including child sexual abuse material (CSAM), grooming, sexualising children, and any attempt to contact children for sexual purposes.",
      "VeeCity is for people aged 16 and over. If we learn that someone under 16 has an account, we remove it.",
    ],
  },
  {
    title: "What is not allowed",
    items: [
      "Sharing, requesting, selling or linking to sexual or exploitative images or videos of children.",
      "Sexual comments about children, or content that sexualises children.",
      "Grooming, or trying to meet, contact or pressure a child for sexual purposes.",
      "Threats, blackmail or pressure involving intimate images of a child.",
      "Listing products or services in Teaky that involve the exploitation of children.",
    ],
  },
  {
    title: "How to report a concern",
    items: [
      "In the app, use the report option on a post, comment or shop. Choose the reason that best fits.",
      "You can also email us at " + EMAIL + " at any time, including about private messages or accounts. Include the username and, if you can, a link or screenshot.",
      "If a child is in immediate danger, contact your local police or emergency services first.",
    ],
  },
  {
    title: "What we do when we receive a report",
    items: [
      "We review child safety reports as a priority, and aim to act within 48 hours.",
      "We remove content that breaks these standards and suspend or permanently remove the accounts responsible.",
      "We keep the information needed for an investigation, and we report child sexual abuse material and exploitation to the relevant national and regional authorities, including the National Center for Missing & Exploited Children (NCMEC) where applicable.",
      "We cooperate with law enforcement requests made under the law.",
    ],
  },
  {
    title: "Contact for child safety matters",
    items: [
      "Our designated point of contact for child safety and CSAM prevention is " + EMAIL + ".",
    ],
  },
];

export const ChildSafety = () => (
  <div className="min-h-screen w-full bg-[#050505] text-zinc-300">
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Link to="/" className="text-xs font-bold uppercase tracking-widest text-blue-400">&larr; Back to VeeCity</Link>
      <h1 className="mt-6 text-4xl font-black tracking-tight text-white">Child safety standards</h1>
      <p className="mt-2 text-sm text-zinc-500">VeeCity (Konnect and Teaky) by NobCyborg. Updated {UPDATED}.</p>

      {SECTIONS.map((s) => (
        <section key={s.title} className="mt-8">
          <h2 className="text-lg font-black text-white">{s.title}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-400">
            {s.items.map((t, i) => (<li key={i}>{t}</li>))}
          </ul>
        </section>
      ))}

      <p className="mt-8 text-sm leading-relaxed text-zinc-400">
        See also our <Link to="/privacy" className="text-blue-400 underline">Privacy Policy</Link>.
      </p>
    </div>
  </div>
);
