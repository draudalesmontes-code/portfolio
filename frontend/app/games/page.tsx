import GameDisplay from "@/components/gameDisplay";

export default function GamesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f1e9] py-16">
      {/* faint dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background:radial-gradient(#161514_1.5px,transparent_1.5px)] [background-size:22px_22px]"
      />

      <div className="relative z-10 flex flex-col items-center gap-14 px-6">
        {/* Title — big pixel font, single hard offset shadow */}
        <h1 className="font-arcade text-5xl text-[#161514] [text-shadow:6px_6px_0_#e63946] sm:text-7xl lg:text-8xl">
          GAMES
        </h1>

        <GameDisplay />
      </div>
    </main>
  );
}
