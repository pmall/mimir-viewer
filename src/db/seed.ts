import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import { db } from "./index"; // .env.local is now reliably loaded here
import { targetFingerprints } from "./schema";

const SEED_FILE = path.join(process.cwd(), "data", "viewer_data.csv");

async function main() {
  console.log("1. Starting CSV parsing...");

  if (!fs.existsSync(SEED_FILE)) {
    throw new Error(`File not found: ${SEED_FILE}`);
  }

  const parser = fs.createReadStream(SEED_FILE).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
    }),
  );

  let batch: any[] = [];
  const BATCH_SIZE = 100; // Small safe batch size
  let totalParsed = 0;
  let totalInserted = 0;

  for await (const record of parser) {
    try {
      // Clean parsing
      const parsedRecord = {
        targetId: record.target_id,
        sequence: record.sequence,
        positions: JSON.parse(record.positions || "[]"),
        mask: JSON.parse(record.mask || "[]"),
        rsasa: JSON.parse(record.rsasa || "[]"),
        smoothedRsasa: JSON.parse(record.smoothed_rsasa || "[]"),
        plddt: JSON.parse(record.plddt || "[]"),
        rsasaThreshold:
          record.rsasa_threshold && record.rsasa_threshold !== "None"
            ? parseFloat(record.rsasa_threshold)
            : null,
      };
      batch.push(parsedRecord);
      totalParsed++;

      if (batch.length >= BATCH_SIZE) {
        console.log(`Parsed ${totalParsed} rows. Inserting batch...`);
        try {
          await db.insert(targetFingerprints).values(batch);
          totalInserted += batch.length;
        } catch (dbErr: any) {
          throw new Error(`DB Insert Error: ${dbErr.message}`);
        }
        batch = [];
      }
    } catch (e: any) {
      // Prevents the giant query parameter array from dumping to the console
      console.error(
        `Failed on target_id: ${record.target_id}. Error: ${e.message}`,
      );
      process.exit(1);
    }
  }

  if (batch.length > 0) {
    console.log(`Parsed total ${totalParsed} rows. Inserting final batch...`);
    try {
      await db.insert(targetFingerprints).values(batch);
      totalInserted += batch.length;
    } catch (e: any) {
      console.error(`Error on final batch insertion: ${e.message}`);
      process.exit(1);
    }
  }

  console.log(`\nSuccess! Inserted ${totalInserted} rows.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error during seeding:", err.message);
  process.exit(1);
});
