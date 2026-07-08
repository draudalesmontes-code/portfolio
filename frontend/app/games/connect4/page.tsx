"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { use } from "react";
import Connect4Game from "@/components/games/Connect4Game";
import {
  isDifficulty,
  type Difficulty,
} from "@/lib/games";

type Connect4PageProps = {
  searchParams: Promise<{
    difficulty?: string | string[];
  }>;
};

export default function Connect4({
  searchParams,
}: Connect4PageProps) {
  const params = use(searchParams);
  const difficulty: Difficulty = isDifficulty(params.difficulty)
    ? params.difficulty
    : "MEDIUM";

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-[#f4f1e9] px-4 py-12">
      <Connect4Game difficulty={difficulty} />

      <Link
        href="/games"
        className="font-arcade text-[10px] text-[#2f6fed] underline underline-offset-4"
      >
        Back to games
      </Link>
    </main>
  );
}
