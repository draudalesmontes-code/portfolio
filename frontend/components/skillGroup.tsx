"use client";

import { useState } from "react";

// Tech-stack-style chips (paper-themed), showing the 5 most relevant skills
// with a show-more toggle for the rest.
export default function SkillGroup({
  title,
  skills,
}: {
  title: string;
  skills: string[];
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? skills : skills.slice(0, 5);
  const hidden = skills.length - 5;

  return (
    <div className="space-y-3">
      <h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#8a6d3b]">
        {title}
      </h3>
      <ul className="flex flex-row flex-wrap gap-2.5">
        {visible.map((skill) => (
          <li
            key={skill}
            className="rounded-full border border-[#ddd4c4] bg-[#fdfcf8] px-4 py-1.5 text-sm text-[#3a352d] shadow-[0_2px_6px_rgba(80,60,30,0.06)]"
          >
            {skill}
          </li>
        ))}
        {hidden > 0 && (
          <li>
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="rounded-full border border-dashed border-[#b25f3e]/50 bg-transparent px-4 py-1.5 text-sm font-medium text-[#b25f3e] transition-colors hover:bg-[#b25f3e]/10"
            >
              {showAll ? "Show less" : `+${hidden} more`}
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
