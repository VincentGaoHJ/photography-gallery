"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect } from "react";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
  currentPath: string;
}

export function MobileMenu({
  open,
  onClose,
  links,
  currentPath,
}: MobileMenuProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <nav
        className={clsx(
          "fixed bottom-0 right-0 top-0 z-50 w-80 max-w-[80vw] border-l border-border bg-background shadow-2xl transition-transform duration-300 ease-out md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col gap-1 p-8 pt-24">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={clsx(
                "py-3 font-heading text-3xl tracking-tight transition-colors hover:text-accent",
                currentPath.startsWith(link.href)
                  ? "text-accent"
                  : "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
