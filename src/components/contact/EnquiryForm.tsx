"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { enquiryTopics } from "@/lib/data";
import { submitEnquiry } from "@/lib/enquiry";
import { TopicSelect } from "./TopicSelect";

const field =
  "w-full rounded-2xl border border-taupe-light bg-cream px-5 py-3.5 text-ink outline-none transition placeholder:text-taupe focus:border-burgundy/50 focus:bg-paper focus:ring-4 focus:ring-burgundy/10";
const label = "mb-2 block text-sm font-medium text-ink/80";

type Status = "idle" | "sending" | "sent" | "error";

export function EnquiryForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    // Honeypot: real people never see this field, bots fill it in.
    if (form.get("website")) return;

    setStatus("sending");
    try {
      await submitEnquiry({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        company: String(form.get("company") ?? ""),
        topic: String(form.get("topic") ?? ""),
        message: String(form.get("message") ?? ""),
      });
      setStatus("sent");
      const confetti = (await import("canvas-confetti")).default;
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.7 },
        colors: ["#561226", "#360a16", "#a8968a", "#e8e0d8"],
        disableForReducedMotion: true,
      });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="relative rounded-[2rem] border border-taupe-light bg-paper p-6 shadow-[0_30px_80px_-30px_rgba(54,10,22,0.25)] md:p-10">
      {/* Glows clipped on their own layer, so the topic dropdown can hang past the card */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-burgundy/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-taupe/10 blur-3xl" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex min-h-[460px] flex-col items-center justify-center text-center"
          >
            <span className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-burgundy text-white">
              <Check className="h-7 w-7" />
            </span>
            <h3 className="font-display font-semibold tracking-[-0.015em] text-2xl text-burgundy">Thank you. We&apos;ve got it from here.</h3>
            <p className="mt-4 max-w-sm text-ink/65">
              Your email app should have opened with the enquiry ready to send. Hit send and
              we&apos;ll get back to you within one working day.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-8 text-xs uppercase tracking-[0.2em] text-taupe-dark transition hover:text-ink"
            >
              Send another enquiry
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            onSubmit={onSubmit}
            className="relative grid gap-5 sm:grid-cols-2"
          >
            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <label>
                Website (leave blank)
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div>
              <label htmlFor="name" className={label}>
                Your name <span className="text-shine">*</span>
              </label>
              <input id="name" name="name" required autoComplete="name" placeholder="Full name" className={field} />
            </div>
            <div>
              <label htmlFor="email" className={label}>
                Email <span className="text-shine">*</span>
              </label>
              <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={field} />
            </div>
            <div>
              <label htmlFor="phone" className={label}>
                Phone <span className="text-shine">*</span>
              </label>
              <input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="+91" className={field} />
            </div>
            <div>
              <label htmlFor="company" className={label}>
                Company / brand
              </label>
              <input id="company" name="company" autoComplete="organization" placeholder="Optional" className={field} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="topic" className={label}>
                What is this about?
              </label>
              <TopicSelect id="topic" name="topic" options={enquiryTopics} placeholder="Please choose…" className={field} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="message" className={label}>
                Tell us about your project <span className="text-shine">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="What are you building, what's slowing you down, and when do you want to launch?"
                className={`${field} resize-y`}
              />
            </div>

            <div className="flex flex-col-reverse items-start justify-between gap-5 sm:col-span-2 sm:flex-row sm:items-center">
              <p className="text-xs text-taupe-dark">
                {status === "error"
                  ? "Something went wrong. Please email us directly instead."
                  : "We use your details only to respond to this enquiry."}
              </p>
              <button
                type="submit"
                disabled={status === "sending"}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-burgundy px-7 py-3.5 font-semibold text-white transition hover:bg-burgundy-deep hover:shadow-[0_14px_40px_-12px_rgba(86,18,38,0.6)] disabled:opacity-60"
              >
                {status === "sending" ? (
                  <>
                    Sending <LoaderCircle className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Send enquiry <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
