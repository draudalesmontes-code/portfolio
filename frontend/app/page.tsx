import Image from "next/image";
import PhotoStack from "@/components/PhotoStack";

export default function Home() {
  return (
    <div className="flex flex-col items-center font-sans">
      <h1 className="w-full py-6 text-center text-4xl font-bold tracking-wide underline underline-offset-4">
        Portfolio
      </h1>

      {/* Hero: blurred background, name on top, animated photo stack below */}
      <section className="relative mx-auto h-86 w-full max-w-2xl overflow-hidden rounded-xl">
        {/* blurred background image */}
        <Image src="/uwBackground.webp" alt="" fill priority sizes="(max-width: 672px) 100vw, 672px" className="object-cover blur-sm" />
        {/* dark overlay so white text stays readable */}
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6">
          <h2 className="text-3xl font-bold text-white drop-shadow">Diego Raudales</h2>
          <PhotoStack />
        </div>
      </section>

      <section className="mx-auto mt-12 w-full max-w-2xl px-4 pb-16">
        <h2 className="text-2xl font-bold">Summary</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          I&apos;m Diego Raudales, a software engineer who builds full-stack systems — from Spring
          Boot and FastAPI services to Next.js front-ends and applied AI. This portfolio is itself a
          live demo of that work: a polyglot, containerized app with an AI assistant and mini-games.
          Replace this text with your own summary.
        </p>
      </section>
    </div>
  );
}
