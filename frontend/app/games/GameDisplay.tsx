"use client";

import Link from "next/link";
import { useState } from "react";
import {
  DIFFICULTIES,
  GAMES,
  type Difficulty,
} from "@/lib/games";

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  EASY: "#5ad469",
  MEDIUM: "#ffd23f",
  HARD: "#e63946",
};

// horizontal hexagon
const HEX_CLIP = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

export default function GameDisplay() {
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");

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
            <p className="font-arcade text-sm tracking-widest text-[#ff2e88]">
              CHOOSE GAME
            </p>
            <div className="flex items-end gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="animate-arcade-blink size-7 bg-cyan-400"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="font-arcade text-[10px] text-cyan-300">
              Difficulty · {difficulty}
            </p>
          </div>
          </div>
        </div>
      </div>

      {/* ── Two brutalist arcade buttons ── */}
      <div className="flex items-start justify-center gap-12">
        {GAMES.map((game) => (
          <div key={game.id} className="flex flex-col items-center gap-3">
            <Link
              href={{
                pathname: game.path,
                query: { difficulty },
              }}
              aria-label={`Play ${game.label} on ${difficulty} difficulty`}
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
