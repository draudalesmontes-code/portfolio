"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function PhotoStack() {
  // starts "stacked"; flips to "apart" right after mount to trigger the drift
  const [apart, setApart] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setApart(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative size-40">
      {/* circle 1 — drifts LEFT */}
      <div
        className={`absolute inset-0 overflow-hidden rounded-full border-4 border-black shadow-lg
                    transition-transform duration-700 ease-out
                    ${apart ? "-translate-x-20" : "translate-x-0"}`}
      >
        <Image
          src="/linkedInPic.jpg"
          alt="Diego Raudales"
          fill
          sizes="160px"
          className="object-cover object-top"
        />
      </div>

      {/* circle 2 — drifts RIGHT */}
      <div
        className={`absolute inset-0 overflow-hidden rounded-full border-4 border-black shadow-lg
                    transition-transform duration-700 ease-out
                    ${apart ? "translate-x-20" : "translate-x-0"}`}
      >
        <Image
          src="/engineeringPic.jpg"
          alt="Diego engineering"
          fill
          sizes="160px"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}
