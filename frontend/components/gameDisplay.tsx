"use client";

import { useState } from "react";

const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  Easy: "#5ad469",
  Medium: "#ffd23f",
  Hard: "#e63946",
};

const GAMES = [
  { id: "tic-tac-toe", label: "Tic-Tac-Toe", color: "#e63946" },
  { id: "connect-4", label: "Connect 4", color: "#2f6fed" },
] as const;

// horizontal hexagon
const HEX_CLIP = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

export default function GameDisplay() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [loading, setLoading] = useState(false);
  const [loadedGame, setLoadedGame] = useState<string | null>(null);

  function startGame(label: string) {
    setLoadedGame(null);
    setLoading(true);
    // simulate loading; real game component would mount here later
    window.setTimeout(() => {
      setLoading(false);
      setLoadedGame(label);
    }, 2200);
  }

  return (
    <div className="flex flex-col items-center gap-12">
      {/* ── Bot difficulty ── */}
      <div className="flex flex-col items-center gap-5">
        <p className="font-arcade text-xs text-[#161514]">Bot Difficulty</p>
        <div className="flex items-center gap-4">
          {DIFFICULTIES.map((level) => {
            const active = difficulty === level;
            const color = DIFFICULTY_COLOR[level];
            return (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                style={{ clipPath: HEX_CLIP, background: "#161514" }}
                className="p-[3px] transition-transform hover:-translate-y-0.5"
              >
                {/* inner hex (the 3px of black showing around it is the border) */}
                <span
                  style={{
                    clipPath: HEX_CLIP,
                    background: active ? color : "#fdfcf8",
                  }}
                  className="block px-8 py-4 font-arcade text-[10px] uppercase text-[#161514]"
                >
                  {level}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* dark cabinet box */}
      <div className="border-4 border-[#161514] bg-[#161514] p-3">
        {/* small background-colored gap between the box and the screen */}
        <div className="bg-[#f4f1e9] p-1.5">
          <div className="animate-arcade-flicker relative h-80 w-80 overflow-hidden bg-[#05040f] sm:h-[26rem] sm:w-[26rem]">
          {/* scanlines */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30 [background:repeating-linear-gradient(to_bottom,transparent_0px,transparent_2px,rgba(0,0,0,0.6)_3px,rgba(0,0,0,0.6)_4px)]"
          />

          <div className="relative flex h-full w-full flex-col items-center justify-center gap-7 px-4 text-center">
            {loadedGame ? (
              // game loaded → squares disappear
              <>
                <p className="font-arcade text-base text-[#5ad469]">{loadedGame}</p>
                <p className="font-arcade text-[10px] text-cyan-300">Ready · {difficulty}</p>
                <p className="font-arcade text-[8px] text-white/40">press a button to swap</p>
              </>
            ) : (
              // idle / loading → "LOADING" + 5 blinking squares
              <>
                <p className="font-arcade text-sm tracking-widest text-[#ff2e88]">LOADING</p>
                <div className="flex items-end gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className="animate-arcade-blink size-7 bg-cyan-400"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <p className="font-arcade text-[8px] text-white/40">
                  {loading ? "booting…" : "insert coin ▾"}
                </p>
              </>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* ── Two brutalist arcade buttons ── */}
      <div className="flex items-start justify-center gap-12">
        {GAMES.map((game) => (
          <div key={game.id} className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => startGame(game.label)}
              aria-label={`Load ${game.label}`}
              style={{ background: game.color }}
              className="size-28 rounded-full border-4 border-[#161514] shadow-[6px_6px_0_0_#161514] transition-transform active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
            />
            <span className="font-arcade text-[10px] text-[#161514]">{game.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
