import Image from "next/image";
import { mediaUrl } from "@/lib/media";

// The home hero reuses the self-portrait (selfie.jpg), as on the original site.
const HERO_IMAGE = {
  key: "about/selfie.jpg",
  src: "https://images.squarespace-cdn.com/content/v1/60eb034b5145ce35fa1057f5/1626021177876-4P22W5EJ2N0C72B3NZSJ/selfie.jpg",
};

export function Hero() {
  return (
    <section className="mx-auto grid max-w-[1500px] grid-cols-1 items-center gap-10 px-6 py-12 md:grid-cols-2 md:gap-16 md:px-10 md:py-16">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
        <Image
          src={mediaUrl(HERO_IMAGE)}
          alt="Haojun (Vincent) Gao"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      <div>
        <div className="flex items-center gap-6">
          <span className="font-heading text-2xl italic">Hello,</span>
          <span className="h-px flex-1 bg-foreground/40" />
        </div>

        <h1 className="mt-6 font-heading text-4xl font-normal leading-[1.16] tracking-tight md:text-[3.4rem]">
          I’m a <em>Landscape photographer</em> based out of{" "}
          <strong className="font-semibold">Beijing, China</strong>. I’m lucky to
          travel the world, documenting this <em>beautiful</em>{" "}
          <strong className="font-semibold">planet</strong> of ours.
        </h1>

        <div className="mt-10 text-3xl text-foreground/60" aria-hidden>
          ⇩
        </div>
      </div>
    </section>
  );
}
