import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about my journey, philosophy, and the gear behind the images.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="mx-auto max-w-4xl px-6">
        {/* Hero */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-16 mb-24">
          <div className="md:col-span-2">
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"
                alt="Photographer portrait"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col justify-center">
            <p className="text-xs tracking-[0.2em] uppercase text-muted mb-4">
              About
            </p>
            <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-tight mb-6">
              Hi, I&apos;m
              <br />
              [Your Name]
            </h1>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                I am a photographer based in [Your City], specializing in
                editorial portraiture and commercial lifestyle photography.
                My work explores the intersection of light, composition, and
                authentic human connection.
              </p>
              <p>
                Over the past decade, I have had the privilege of working
                with editorial publications, fashion brands, and
                individuals who trust me to tell their visual stories.
              </p>
              <p>
                When I&apos;m not behind the camera, you can find me
                exploring the outdoors, studying art history, or chasing
                the perfect espresso.
              </p>
            </div>
          </div>
        </div>

        {/* Philosophy */}
        <section className="mb-24">
          <h2 className="font-serif text-2xl md:text-3xl font-medium mb-8">
            Philosophy
          </h2>
          <div className="space-y-4 text-muted leading-relaxed max-w-2xl">
            <p>
              I believe the best photographs happen when technical precision
              meets genuine human connection. My approach is collaborative —
              I work with my subjects, not at them.
            </p>
            <p>
              Every face has a story. Every space has light worth finding.
              My job is to bring these elements together in a single frame
              that feels both honest and considered.
            </p>
          </div>
        </section>

        {/* Equipment */}
        <section className="mb-24">
          <h2 className="font-serif text-2xl md:text-3xl font-medium mb-8">
            Equipment
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            {[
              {
                label: "Primary Camera",
                value: "Medium Format Digital, 100MP",
              },
              { label: "Secondary Camera", value: "Full-Frame Mirrorless" },
              { label: "Favorite Lens", value: "80mm f/2.8" },
              { label: "Lighting", value: "Profoto B10 system" },
              { label: "Post-Production", value: "Capture One + Photoshop" },
              { label: "Film Stock (when shooting film)", value: "Portra 400" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <span className="text-xs tracking-widest uppercase text-muted">
                  {item.label}
                </span>
                <span className="text-sm">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Clients / Features */}
        <section>
          <h2 className="font-serif text-2xl md:text-3xl font-medium mb-8">
            Clients &amp; Features
          </h2>
          <div className="flex flex-wrap gap-4">
            {[
              "Vogue",
              "Harper's Bazaar",
              "ELLE",
              "GQ",
              "Nike",
              "Apple",
              "Airbnb",
              "National Geographic",
            ].map((client) => (
              <span
                key={client}
                className="px-5 py-2.5 border border-border text-sm tracking-wide hover:border-foreground transition-colors"
              >
                {client}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}