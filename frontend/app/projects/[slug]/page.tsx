// Dynamic route: matches /projects/<anything>.
// In Next 15+/16, `params` is a Promise, so the component is async and we await it.

import fs from "node:fs"
import path from "node:path";
import matter from "gray-matter";
import Image from "next/image";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const filePath = path.join(process.cwd(),"content/projects",`${slug}.mdx`)
  const raw = fs.readFileSync(filePath,"utf8");
  const {data, content} = matter(raw);


  return (
    <main className="mx-auto max-w-3xl p-8">
            <h1 className="text-center text-3xl font-bold py-5">Project: {slug}</h1>
      <div className="relative h-60 w-120  overflow-hidden rounded-xl">
      <Image src={data.image} alt={data.title} fill className="object-fit"/>
      </div>
    </main>
  );
}
