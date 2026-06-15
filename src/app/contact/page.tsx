import type { Metadata } from "next";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Haojun (Vincent) Gao.",
};

const CONTACT_HEADLINE =
  "Have camera, will travel. Available for assignments, large and small, especially ones that require extensive trekking or extreme weather conditions.";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1500px] px-6 py-20 md:px-10 md:py-28">
      <p className="font-heading text-2xl italic text-muted">Contact</p>
      <h1 className="mt-2 max-w-5xl font-heading text-4xl font-medium leading-tight tracking-tight md:text-6xl">
        {CONTACT_HEADLINE}
      </h1>

      <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div>
          <p className="label mb-3 text-muted">Email</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-heading text-2xl transition-colors hover:text-accent md:text-3xl"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
        <div>
          <p className="label mb-3 text-muted">Phone</p>
          <a
            href={`tel:${CONTACT_PHONE.replace(/[^\d+]/g, "")}`}
            className="font-heading text-2xl transition-colors hover:text-accent md:text-3xl"
          >
            {CONTACT_PHONE}
          </a>
        </div>
      </div>
    </div>
  );
}
