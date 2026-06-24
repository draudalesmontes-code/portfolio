// Dynamic route: matches /projects/<anything>.
// In Next 15+/16, `params` is a Promise, so the component is async and we await it.
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">Project: {slug}</h1>
      <p className="mt-4 text-muted-foreground">
        Write-up for “{slug}” coming soon.
      </p>
    </main>
  );
}
