"use client";

import { useState } from "react";
import Image from "next/image";
import { Briefcase, CalendarDays, MapPin } from "lucide-react";

export type Job = {
  company: string;
  position: string;
  date: string;
  location: string;
  description: string;
  image?: string; // optional headshot/logo — falls back to an icon placeholder
};

export default function InternCard({
  company,
  position,
  date,
  location,
  description,
  image,
}: Job) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border border-[#ddd4c4] bg-[#fdfcf8] shadow-[0_6px_18px_rgba(80,60,30,0.08)]">
      {/* company title — spans the full width */}
      <h3 className="border-b border-[#e6ddcd] bg-[#f6f1e6] px-5 py-3 font-semibold tracking-tight text-[#2c2a26]">
        {company}
      </h3>

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1.6fr)] sm:gap-5">
        {/* col 1 — rounded photo */}
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-[#ddd4c4] bg-[#efe8da]">
          {image ? (
            <Image src={image} alt={company} fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <Briefcase className="size-7 text-[#b9ad94]" />
            </span>
          )}
        </div>

        {/* col 2 — position, date, location */}
        <div className="flex flex-col justify-center gap-1.5">
          <p className="font-medium text-[#2c2a26]">{position}</p>
          <p className="flex items-center gap-1.5 text-sm text-[#6b6155]">
            <CalendarDays className="size-3.5 shrink-0 text-[#b25f3e]" />
            {date}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-[#6b6155]">
            <MapPin className="size-3.5 shrink-0 text-[#b25f3e]" />
            {location}
          </p>
        </div>

        {/* col 3 — description, clamped with show more */}
        <div className="flex flex-col gap-1">
          <p
            className={`text-sm leading-relaxed text-[#4a443b] ${
              expanded ? "" : "line-clamp-3"
            }`}
          >
            {description}
          </p>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="self-start text-xs font-semibold text-[#b25f3e] underline-offset-2 hover:underline"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        </div>
      </div>
    </article>
  );
}
