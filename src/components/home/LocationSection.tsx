export function LocationSection() {
  return (
    <section className="mx-auto max-w-[1500px] px-6 py-20 text-center md:px-10 md:py-28">
      <p className="font-heading text-2xl italic text-muted">Current Location</p>
      <h2 className="mt-1 font-heading text-5xl font-medium tracking-tight md:text-7xl">
        Beijing, China
      </h2>

      <div className="mt-12 overflow-hidden bg-surface">
        {/* OpenStreetMap embed — keyless and reachable both inside the GFW and
            abroad (Google Maps is blocked in mainland China, which threw a
            client-side TimeoutError on this page). */}
        <iframe
          title="Current location — Beijing, China"
          src="https://www.openstreetmap.org/export/embed.html?bbox=115.70,39.45,117.10,40.35&layer=mapnik&marker=39.9042,116.4074"
          className="h-[420px] w-full border-0 md:h-[560px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <a
        href="https://www.openstreetmap.org/?mlat=39.9042&mlon=116.4074#map=10/39.9042/116.4074"
        target="_blank"
        rel="noreferrer"
        className="label mt-3 inline-block text-xs text-muted transition-colors hover:text-accent"
      >
        View larger map
      </a>
    </section>
  );
}
