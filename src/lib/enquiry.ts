import { CONTACT } from "./data";

export type Enquiry = {
  name: string;
  email: string;
  phone: string;
  company: string;
  topic: string;
  message: string;
};

/**
 * Sends an enquiry from the /contact form.
 *
 * BACKEND HANDOFF: there is no server yet, so this opens the visitor's email app
 * with the enquiry pre-filled. Replace the body with a POST to your API / CRM
 * (e.g. `await fetch("/api/enquiry", { method: "POST", body: JSON.stringify(data) })`)
 * and throw on failure — the form already shows loading, success and error states.
 */
export async function submitEnquiry(data: Enquiry): Promise<void> {
  const subject = `New enquiry: ${data.topic || "General"} — ${data.name}`;
  const body = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    ...(data.company ? [`Company: ${data.company}`] : []),
    `Topic: ${data.topic || "Not specified"}`,
    "",
    data.message,
  ].join("\n");

  window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
