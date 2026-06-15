import Link from "next/link";
import {
  SITE_NAME,
  NAV_LINKS,
  CONTACT_EMAIL,
  INSTAGRAM_URL,
} from "@/lib/constants";

const NEWSLETTER_BLURB =
  "My entertaining and infrequent newsletter is full of stories, photography tips and images that don’t make it to the blog.";

const FOOTER_LINKS = [{ href: "/", label: "Work" }, ...NAV_LINKS];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-[1500px] px-6 py-16 md:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand + newsletter blurb */}
          <div>
            <p className="font-heading text-2xl font-medium">{SITE_NAME}</p>
            <p className="mt-3 max-w-xs leading-relaxed text-muted">
              {NEWSLETTER_BLURB}
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="label mb-4 text-muted">Explore</p>
            <div className="flex flex-col gap-2">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="w-fit text-muted transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="label mb-4 text-muted">Contact</p>
            <div className="flex flex-col gap-2">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="w-fit text-muted transition-colors hover:text-accent"
              >
                {CONTACT_EMAIL}
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit text-muted transition-colors hover:text-accent"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="label text-muted">
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
        </div>
      </div>
    </footer>
  );
}
