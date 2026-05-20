import { SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <p className="font-serif text-lg font-semibold">{SITE_NAME}</p>
            <p className="mt-2 text-sm text-muted leading-relaxed max-w-xs">
              Editorial and portrait photography. Capturing stories through
              light and shadow.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs tracking-widest uppercase text-muted mb-4">
              Navigate
            </p>
            <div className="flex flex-col gap-2">
              {[
                { href: "/", label: "Home" },
                { href: "/gallery", label: "Gallery" },
                { href: "/blog", label: "Journal" },
                { href: "/about", label: "About" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted hover:text-foreground transition-colors w-fit"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="text-xs tracking-widest uppercase text-muted mb-4">
              Connect
            </p>
            <div className="flex flex-col gap-2">
              {Object.entries(SOCIAL_LINKS).map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted hover:text-foreground transition-colors w-fit capitalize"
                >
                  {name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-xs text-muted">
          &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}