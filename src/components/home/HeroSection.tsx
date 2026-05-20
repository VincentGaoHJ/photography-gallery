import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* Placeholder: replace with an actual S3 image */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950" />

      {/* Overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
        <p className="font-serif text-lg md:text-xl italic text-white/70 mb-6 tracking-wide">
          Editorial &amp; Portrait Photographer
        </p>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-semibold leading-none tracking-tight">
          Capturing stories
          <br />
          through light
        </h1>
        <p className="mt-8 text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
          Exploring the intersection of light, composition, and human
          connection. Based in [Your City], working worldwide.
        </p>
        <div className="mt-10 flex items-center justify-center gap-6">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 border border-white/30 bg-white/10 backdrop-blur-sm px-8 py-3 text-sm tracking-widest uppercase transition-all hover:bg-white hover:text-black"
          >
            View Gallery
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-white/60 transition-colors hover:text-white"
          >
            About Me &rarr;
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-xs tracking-widest uppercase">
        <span>Scroll</span>
        <div className="h-8 w-px bg-white/20" />
      </div>
    </section>
  );
}