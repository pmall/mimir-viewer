import Link from "next/link";
import { db } from "@/db";
import { targetFingerprints } from "@/db/schema";
import { sql } from "drizzle-orm";
import SearchForm from "@/components/SearchForm";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch 5 random target IDs
  const randomTargets = await db
    .select({ targetId: targetFingerprints.targetId })
    .from(targetFingerprints)
    .orderBy(sql`RANDOM()`)
    .limit(5);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-slate-50 font-sans p-6">
      <main className="flex w-full flex-col items-center gap-10 max-w-2xl text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Mímir Structure Viewer
          </h1>
          <p className="text-lg text-slate-400">
            Explore the 1D structural fingerprints of nearly 20,000 human
            proteins mapped with predicted characteristics from ESM-3.
          </p>
        </div>

        <div className="w-full flex justify-center">
          <SearchForm />
        </div>

        <div className="w-full text-left bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mt-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Random Examples from Database
          </h2>
          <div className="flex flex-wrap gap-3">
            {randomTargets.map((target) => (
              <Link
                key={target.targetId}
                href={`/viewer/${target.targetId}`}
                className="flex items-center justify-center rounded-md bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-700 hover:border-slate-500 text-slate-300 hover:text-white"
              >
                {target.targetId}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
