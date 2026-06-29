import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import Image from "next/image";
import Link from "next/link";

type Project = {
  slug: string;
  title: string;
  image?: string;
  technologies: string[];
};

function getProjects(): Project[] {
  const dir = path.join(process.cwd(), "content/projects");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const { data } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      return {
        slug,
        title: data.title ?? slug,
        image: data.image,
        technologies: data.technologies ?? [],
      };
    });
}

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <main className="min-h-screen bg-[#f4f1e9] text-[#161514]">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
          Projects
        </h1>
        <p className="mt-4 font-mono text-sm text-[#161514]/50">
          {projects.length} projects
        </p>

        <div className="mt-12 flex flex-col gap-6">
          {projects.map((project, idx) => (
            <Link key={project.slug} href={`/projects/${project.slug}`}>
              <article className="group flex gap-6 border-2 border-[#161514] bg-white p-5 shadow-[4px_4px_0_0_#161514] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#ff5436]">
                {/* index number */}
                <span className="shrink-0 font-mono text-sm text-[#ff5436]">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                {/* thumbnail */}
                {project.image && (
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden border border-[#161514]/20 bg-[#f4f1e9]">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                )}

                {/* text */}
                <div className="flex min-w-0 flex-col justify-center gap-2">
                  <h2 className="font-mono text-sm font-bold uppercase tracking-[0.2em] transition-colors group-hover:text-[#ff5436]">
                    {project.title}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="border border-[#161514]/30 px-2 py-0.5 font-mono text-xs text-[#161514]/60"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="font-mono text-xs text-[#161514]/40">
                        +{project.technologies.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
