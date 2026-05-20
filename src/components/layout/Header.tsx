"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { MobileMenu } from "./MobileMenu";
import clsx from "clsx";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = pathname === "/";

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-500",
        isHome
          ? "text-white [&_a]:text-white"
          : "text-foreground bg-background/80 backdrop-blur-md border-b border-border"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-tight hover:opacity-70 transition-opacity"
        >
          {SITE_NAME}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "text-sm tracking-widest uppercase transition-opacity hover:opacity-70",
                pathname === link.href && "opacity-100 font-medium",
                pathname !== link.href && "opacity-60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span
            className={clsx(
              "block h-px w-5 transition-all",
              isHome ? "bg-white" : "bg-foreground",
              menuOpen && "translate-y-[5px] rotate-45"
            )}
          />
          <span
            className={clsx(
              "block h-px w-5 transition-all",
              isHome ? "bg-white" : "bg-foreground",
              menuOpen && "opacity-0"
            )}
          />
          <span
            className={clsx(
              "block h-px w-5 transition-all",
              isHome ? "bg-white" : "bg-foreground",
              menuOpen && "-translate-y-[5px] -rotate-45"
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