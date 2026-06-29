// Dynamic route: matches /projects/<slug>.
// In Next 15+/16, `params` is a Promise, so the component is async and we await it.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import Image from "next/image";
import type { ReactNode } from "react";

type Section = { title: string; body: string };

// Split the markdown body into ordered sections using the top-level "# " headings,
// so we can lay each one out ourselves instead of dumping the body as one blob.
function getSections(content: string): Section[] {
  const sections: Section[] = [];
  const parts = content.split(/^#\s+(.+)$/gm); // [pre, title, body, title, body, ...]
  for (let i = 1; i < parts.length; i += 2) {
    sections.push({ title: parts[i].trim(), body: parts[i + 1].trim() });
  }
  return sections;
}

// Inline markdown: **bold** and `code`.
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-bold text-[#161514]">
          {m[1]}
        </strong>,
      );
    } else if (m[2] !== undefined) {
      nodes.push(
        <code
          key={`${keyPrefix}-c${i}`}
          className="bg-[#161514]/8 px-1.5 py-0.5 font-mono text-[0.85em]"
        >
          {m[2]}
        </code>,
      );
    }
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

// Block markdown: paragraphs, "-" lists, and "1." numbered lists.
function SectionBody({ body }: { body: string }) {
  const blocks = body.split(/\n{2,}/);
  return (
    <div className="space-y-4 text-[#161514]/85">
      {blocks.map((block, bi) => {
        const lines = block
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        const isUl = lines.length > 0 && lines.every((l) => l.startsWith("- "));
        const isOl = lines.length > 0 && lines.every((l) => /^\d+\.\s/.test(l));

        if (isUl) {
          return (
            <ul key={bi} className="space-y-2">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-3">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-[#ff5436]" />
                  <span className="leading-relaxed">
                    {renderInline(l.slice(2), `${bi}-${li}`)}
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        if (isOl) {
          return (
            <ol key={bi} className="space-y-2">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-3">
                  <span className="font-mono text-sm text-[#ff5436]">
                    {String(li + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-relaxed">
                    {renderInline(l.replace(/^\d+\.\s/, ""), `${bi}-${li}`)}
                  </span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={bi} className="text-lg leading-relaxed">
            {renderInline(lines.join(" "), `${bi}`)}
          </p>
        );
      })}
    </div>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const filePath = path.join(process.cwd(), "content/projects", `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const sections = getSections(content);
  const technologies: string[] = data.technologies ?? [];

  // Always show a Challenges section, even if the .mdx doesn't define one yet.
  if (!sections.some((s) => s.title.toLowerCase() === "challenges")) {
    sections.push({ title: "Challenges", body: "" });
  }

  return (
    <main className="min-h-screen bg-[#f4f1e9] text-[#161514] selection:bg-[#ff5436] selection:text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* title */}
        <h1 className="text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
          {data.title ?? slug}
        </h1>

        {data.github && (
          <a
            href={data.github}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block border-2 border-[#161514] bg-white px-3 py-1.5 font-mono text-xs uppercase tracking-widest shadow-[3px_3px_0_0_#161514] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#ff5436]"
          >
            View source ↗
          </a>
        )}

        {/* cover image — framed with a hard offset shadow */}
        {data.image && (
          <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden border-2 border-[#161514] bg-white shadow-[8px_8px_0_0_#161514]">
            <Image
              src={data.image}
              alt={data.title ?? slug}
              fill
              className="object-contain p-6"
            />
          </div>
        )}

        {/* every section from the .mdx, plus Tech Stack cards and Challenges */}
        {sections.map((section, idx) => {
          const key = section.title.toLowerCase();
          const num = String(idx + 1).padStart(2, "0");

          return (
            <section key={section.title} className="mt-14">
              <header className="mb-5 flex items-baseline gap-3 border-b-2 border-[#161514] pb-2">
                <span className="font-mono text-sm text-[#ff5436]">{num}</span>
                <h2 className="font-mono text-sm font-bold uppercase tracking-[0.25em]">
                  {section.title}
                </h2>
              </header>

              {key === "tech stack" ? (
                <ul className="flex flex-row flex-wrap gap-3">
                  {technologies.map((tech) => (
                    <li
                      key={tech}
                      className="group flex items-center gap-2 border-2 border-[#161514] bg-white px-4 py-2.5 font-mono text-sm font-medium shadow-[3px_3px_0_0_#161514] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#ff5436] hover:text-white hover:shadow-[5px_5px_0_0_#161514]"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 bg-[#ff5436] transition-colors group-hover:bg-white" />
                      {tech}
                    </li>
                  ))}
                </ul>
              ) : section.body ? (
                <SectionBody body={section.body} />
              ) : (
                <p className="border-2 border-dashed border-[#161514]/30 px-4 py-6 text-center font-mono text-sm text-[#161514]/50">
                  Notes coming soon.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
