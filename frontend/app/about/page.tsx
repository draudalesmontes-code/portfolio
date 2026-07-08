import Image from "next/image";
import EducationCard from "@/components/educationCard";
import InternCard, { type Job } from "@/components/internCard";
import SkillGroup from "@/components/skillGroup";

// NOTE: job locations are best-guess placeholders — verify/replace as needed.
const jobs: Job[] = [
  {
    company: "Espresso Americano",
    position: "AWS Bedrock AgentCore Programmer",
    date: "Jun 2025 – Aug 2025",
    location: "Tegucigalpa, Honduras",
    description:
      "Prototyped an AWS Bedrock AgentCore backend, debugging and extending three MCP tools for secure database access while integrating the memory, identity, and gateway modules. Wrote 30 Python unit and integration tests for the MCP tools and automation scripts, and used the Linux CLI with internal version control to streamline deployment and debugging.",
  },
  {
    company: "ITA at UW-Madison",
    position: "Python Programming Instructor",
    date: "Sep 2024 – May 2026",
    location: "Madison, WI",
    description:
      "Taught Python to cohorts of 13+ high school students for 20 hours a week, covering data structures, algorithms, and code review. Introduced test-driven development principles to reinforce software quality and build strong engineering habits early.",
  },
  {
    company: "PixelPay",
    position: "IT Intern",
    date: "Jun 2024 – Aug 2024",
    location: "Tegucigalpa, Honduras",
    description:
      "Resolved 30+ client-reported tickets and improved the web product UI in close coordination with internal engineering teams, working within an agile development process to ship fixes and enhancements reliably.",
  },
  {
    company: "Sis Colombia",
    position: "Database Intern",
    date: "Jun 2023 – Aug 2023",
    location: "Bogotá, Colombia",
    description:
      "Built Python ETL pipelines on AWS to migrate over 1 TB of on-premises database data to the cloud, then delivered analytics dashboards in Athena and QuickSight that gave client data teams clear, queryable insight into their data.",
  },
  {
    company: "Aduo Grupo",
    position: "Frontend Web Developer",
    date: "Jun 2022 – Aug 2022",
    location: "Tegucigalpa, Honduras",
    description:
      "Shipped two client websites in close collaboration with digital designers, translating polished visual designs into responsive, pixel-faithful frontend implementations.",
  },
];

// Each list is ordered most-relevant first; SkillGroup shows the top 5 + a toggle.
const skillGroups: { title: string; skills: string[] }[] = [
  {
    title: "Languages",
    skills: ["Python", "Java", "C++", "JavaScript", "SQL", "C", "Kotlin", "SystemVerilog", "HTML/CSS"],
  },
  {
    title: "Frameworks",
    skills: ["React", "Spring Boot", "FastAPI", "Kubernetes", "REST APIs", "Helm"],
  },
  {
    title: "AI & Data",
    skills: ["Claude (Claude Code)", "AWS Bedrock", "FAISS", "Docker", "AWS", "ChatGPT Codex", "Athena", "QuickSight", "ETL pipelines"],
  },
  {
    title: "Systems",
    skills: ["CUDA", "OpenMP", "RISC-V", "SPI", "UART", "Assembly", "HPC/SLURM", "I2C", "GPIO", "Altium", "PCB"],
  },
  {
    title: "Practices",
    skills: ["Agile/Scrum", "CI/CD", "Git", "Test-Driven Development", "Automated testing", "Code review", "Linux CLI", "Algorithms"],
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#2c2a26]">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Hero: three staggered image cards with the title card on top */}
        <section className="relative mb-20">
          <div className="flex items-start justify-center gap-4 sm:gap-6">
            <AboutImage
              src="/aboutPic1.JPG"
              alt="Diego outdoors"
              className="mt-10 h-52 w-36 -rotate-3 sm:w-40"
            />
            <AboutImage
              src="/aboutPic2.JPG"
              alt="Diego smiling"
              className="h-72 w-40 sm:w-48"
              priority
            />
            <AboutImage
              src="/engineeringPic.jpg"
              alt="Diego working on an engineering project"
              className="mt-16 h-56 w-36 rotate-3 sm:w-40"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl border border-[#ddd4c4] bg-[#fdfcf8]/95 px-10 py-6 shadow-[0_12px_36px_rgba(80,60,30,0.18)] backdrop-blur-sm">
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">About me</h1>
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="mb-14">
          <EducationCard />
        </section>

        {/* Experience — scrollable, ~3 jobs visible at a time */}
        <section className="mb-14">
          <h2 className="mb-5 font-mono text-sm font-bold uppercase tracking-[0.25em] text-[#8a6d3b]">
            Experience
          </h2>
          <div className="max-h-[34rem] space-y-5 overflow-y-auto rounded-2xl border border-[#e6ddcd] bg-[#efe8da]/40 p-4 [scrollbar-color:#b25f3e_transparent]">
            {jobs.map((job) => (
              <InternCard key={job.company} {...job} />
            ))}
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2 className="mb-6 font-mono text-sm font-bold uppercase tracking-[0.25em] text-[#8a6d3b]">
            Skills
          </h2>
          <div className="space-y-7">
            {skillGroups.map((group) => (
              <SkillGroup key={group.title} title={group.title} skills={group.skills} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function AboutImage({
  alt,
  className,
  priority = false,
  src,
}: {
  alt: string;
  className?: string;
  priority?: boolean;
  src: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#ddd4c4] bg-[#fbf8f1] shadow-[0_8px_24px_rgba(80,60,30,0.10)] ${className ?? ""}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 9rem, 12rem"
        className="object-cover"
      />
    </div>
  );
}
