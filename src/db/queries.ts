import { eq } from "drizzle-orm";
import { db } from "./index";
import { targetFingerprints } from "./schema";

export async function getFingerprintByTargetId(targetId: string) {
  const results = await db
    .select()
    .from(targetFingerprints)
    .where(eq(targetFingerprints.targetId, targetId))
    .limit(1);

  return results.length > 0 ? results[0] : null;
}
