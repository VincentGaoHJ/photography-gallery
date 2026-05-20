import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center px-6">
        <p className="font-serif text-8xl font-semibold tracking-tight mb-4">
          404
        </p>
        <p className="text-muted text-lg mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-foreground px-8 py-3 text-sm tracking-widest uppercase transition-all hover:bg-foreground hover:text-background"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}