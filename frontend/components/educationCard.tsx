import { GraduationCap } from "lucide-react";

// Two-column, single-row card: degree/school on the left, GPA on the right.
export default function EducationCard() {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#ddd4c4] bg-[#fdfcf8] shadow-[0_6px_18px_rgba(80,60,30,0.08)] sm:grid-cols-[1fr_auto]">
      {/* left: education */}
      <div className="flex items-start gap-3 p-6">
        <GraduationCap className="mt-0.5 size-6 shrink-0 text-[#b25f3e]" />
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#8a6d3b]">
            Education
          </p>
          <p className="mt-2 font-semibold text-[#2c2a26]">
            University of Wisconsin–Madison
          </p>
          <p className="text-sm text-[#4a443b]">
            B.S., Computer Engineering &amp; Computer Science
          </p>
          <p className="mt-1 text-sm text-[#6b6155]">Aug 2022 – May 2026 · Madison, WI</p>
        </div>
      </div>

      {/* right: GPA */}
      <div className="flex flex-col items-center justify-center border-t border-[#e6ddcd] bg-[#f6f1e6] px-10 py-6 sm:border-t-0 sm:border-l">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#8a6d3b]">
          GPA
        </p>
        <p className="mt-1 text-3xl font-black text-[#2c2a26]">3.623</p>
      </div>
    </div>
  );
}
