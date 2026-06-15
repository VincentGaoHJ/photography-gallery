import Image from "next/image";
import type { Metadata } from "next";
import { mediaUrl } from "@/lib/media";
import { SITE_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Haojun (Vincent) Gao — travel, landscape, and street photography.",
};

const PORTRAIT = {
  key: "about/selfie.jpg",
  src: "https://images.squarespace-cdn.com/content/v1/60eb034b5145ce35fa1057f5/1626021177876-4P22W5EJ2N0C72B3NZSJ/selfie.jpg",
};

const BIO = [
  "I’m ecstatic to have my first camera (Sony A7M3) this summer before I set foot on the land of Tibet, China. Before that, my travels take me to some of the world’s most incredible wild places and I’m honored to have the opportunity to capture and share them.",
  "Later, I embraced a Leica Q3, navigating between travel, landscape photography, hiking, mountaineering, and street photography — always seeking to merge more deeply with the world. This has become my philosophy.",
  "Technically, I won’t see myself as a professional photographer, at least not a full-time one, but I still can’t help sharing these incredible moments with you, which enlightened my life.",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-28">
      <p className="font-heading text-2xl italic text-muted">About</p>
      <h1 className="mt-2 max-w-3xl font-heading text-4xl font-medium tracking-tight md:text-6xl">
        {SITE_TAGLINE}
      </h1>

      <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-5 md:gap-16">
        <div className="md:col-span-2">
          <div className="relative aspect-[4/5] overflow-hidden bg-surface">
            <Image
              src={mediaUrl(PORTRAIT)}
              alt="Haojun (Vincent) Gao"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="space-y-5 text-lg leading-relaxed text-foreground/90 md:col-span-3 md:text-xl">
          {BIO.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
