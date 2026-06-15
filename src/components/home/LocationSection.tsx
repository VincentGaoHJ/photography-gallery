export function LocationSection() {
  return (
    <section className="mx-auto max-w-[1500px] px-6 py-20 text-center md:px-10 md:py-28">
      <p className="font-heading text-2xl italic text-muted">Current Location</p>
      <h2 className="mt-1 font-heading text-5xl font-medium tracking-tight md:text-7xl">
        Beijing, China
      </h2>

      <div className="mt-12 overflow-hidden bg-surface">
        <iframe
          title="Current location — Beijing, China"
          src="https://www.google.com/maps?q=Beijing,China&z=10&output=embed"
          className="h-[420px] w-full border-0 md:h-[560px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
