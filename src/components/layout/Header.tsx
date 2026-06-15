"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_LINKS, SITE_NAME, INSTAGRAM_URL } from "@/lib/constants";
import { MobileMenu } from "./MobileMenu";

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          className="font-heading text-2xl font-medium tracking-tight transition-colors hover:text-accent md:text-[1.75rem]"
        >
          {SITE_NAME}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "label transition-colors hover:text-accent",
                  active ? "text-accent" : "text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-foreground transition-colors hover:text-accent"
          >
            <InstagramIcon />
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex flex-col gap-[5px] p-2 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span
            className={clsx(
              "block h-px w-6 bg-foreground transition-all",
              menuOpen && "translate-y-[6px] rotate-45"
            )}
          />
          <span
            className={clsx(
              "block h-px w-6 bg-foreground transition-all",
              menuOpen && "opacity-0"
            )}
          />
          <span
            className={clsx(
              "block h-px w-6 bg-foreground transition-all",
              menuOpen && "-translate-y-[6px] -rotate-45"
            )}
          />
        </button>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={NAV_LINKS}
        currentPath={pathname}
      />
    </header>
  );
}
