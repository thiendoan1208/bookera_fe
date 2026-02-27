import Logo from "@/components/app/logo";
import routes from "@/routes/routes";
import { BookOpen, House } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-b from-zinc-50 via-white to-zinc-100">
      <div className="pointer-events-none absolute -top-24 -left-24 size-80 rounded-full bg-zinc-200/50 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-80 rounded-full bg-zinc-300/40 blur-3xl animate-pulse [animation-delay:0.6s]" />

      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-[fade-in_0.5s_ease-out] mb-6">
          <Logo size="60px" />
        </div>

        <div className="inline-flex items-center justify-center size-20 rounded-full bg-zinc-900 text-white shadow-lg mb-6 animate-[fade-in_0.7s_ease-out]">
          <BookOpen className="size-9" />
        </div>

        <p className="text-zinc-400 tracking-[0.35em] uppercase text-xs md:text-sm animate-[fade-in_0.8s_ease-out]">
          Error 404
        </p>
        <h1 className="mt-3 font-[playfair-display] text-4xl md:text-6xl font-bold text-zinc-900 animate-[fade-in_0.9s_ease-out]">
          Lost Between Shelves
        </h1>
        <p className="mt-4 max-w-xl text-zinc-600 text-sm md:text-base leading-relaxed animate-[fade-in_1s_ease-out]">
          The page you are looking for does not exist or has been moved. Please
          return to the main page to continue exploring books on Bookera.
        </p>

        <div className="mt-8 animate-[fade-in_1.1s_ease-out]">
          <Link
            href={routes.home}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-white font-semibold hover:bg-black transition-colors"
          >
            <House className="size-4" />
            Back To Home
          </Link>
        </div>
      </section>
    </main>
  );
}
