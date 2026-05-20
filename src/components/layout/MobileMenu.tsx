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
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <nav
        className={clsx(
          "fixed top-0 right-0 bottom-0 w-80 bg-background border-l border-border shadow-2xl md:hidden transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col gap-1 p-8 pt-24">
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={clsx(
                "py-3 font-serif text-2xl tracking-tight transition-opacity hover:opacity-70",
                currentPath === link.href
                  ? "opacity-100 text-accent"
                  : "opacity-80",
                // Stagger animation
                open && "animate-[slideIn_0.3s_ease-out_both]"
              )}
              style={{ animationDelay: open ? `${i * 80}ms` : "0ms" }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}