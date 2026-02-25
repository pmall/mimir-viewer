import Link from "next/link";
import { db } from "@/db";
import { targetFingerprints } from "@/db/schema";
import { sql } from "drizzle-orm";

export default async function Home() {
  // Fetch a random target ID for easy testing
  const randomTarget = await db
    .select({ targetId: targetFingerprints.targetId })
    .from(targetFingerprints)
    .orderBy(sql`RANDOM()`)
    .limit(1);

  const sampleId =
    randomTarget.length > 0 ? randomTarget[0].targetId : "A0A024R1R8";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-slate-50 font-sans p-4">
      <main className="flex flex-col items-center gap-8 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Mímir Structure Viewer
        </h1>

        <p className="text-lg text-slate-400">
          Explore the 1D structural fingerprints of nearly 20,000 human proteins
          mapped with predicted characteristics from ESM-3.
        </p>

        <div className="flex gap-4 mt-8">
          <Link
            href={`/viewer/${sampleId}`}
            className="flex h-12 items-center justify-center rounded-lg bg-indigo-600 px-8 font-semibold transition-colors hover:bg-indigo-500"
          >
            Explore Random Target ({sampleId})
          </Link>
        </div>
      </main>
    </div>
  );
}
