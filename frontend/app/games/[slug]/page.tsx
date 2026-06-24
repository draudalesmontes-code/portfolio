// Dynamic route: matches /games/<anything> (tic-tac-toe, connect-4, …).
// You'll likely replace this with a real game component per slug later.
export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">Game: {slug}</h1>
      <p className="mt-4 text-muted-foreground">“{slug}” coming soon.</p>
    </main>
  );
}
