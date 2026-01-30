/**
 * Migration: Add content field to existing QuranEntry test objects.
 * Sets content.type = 'custom' and content.customDescription = existing note
 * for newTest, recentTest, olderTest when content is missing.
 *
 * Run: npx ts-node scripts/migrate-quran-entry-content.ts
 * (from backend directory; ensure .env and database_url are set)
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const databaseUrl = process.env.database_url;
if (!databaseUrl) {
  console.error('Missing database_url in .env');
  process.exit(1);
}

async function run(url: string) {
  await mongoose.connect(url);

  // Use raw collection to avoid schema defaults overwriting; or use model with strict:false
  const db = mongoose.connection.db;
  if (!db) {
    console.error('No database connection');
    process.exit(1);
  }

  const collection = db.collection('quranentries');
  const cursor = collection.find({});

  let updated = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (!doc) continue;

    const update: Record<string, unknown> = {};
    let needsUpdate = false;

    for (const key of ['newTest', 'recentTest', 'olderTest'] as const) {
      const test = doc[key];
      if (!test || typeof test !== 'object') continue;

      const hasContent = test.content != null && typeof test.content === 'object';
      if (!hasContent) {
        update[`${key}.content`] = {
          type: 'custom',
          customDescription: typeof test.note === 'string' ? test.note : '',
        };
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      await collection.updateOne({ _id: doc._id }, { $set: update });
      updated += 1;
    }
  }

  console.log(`Migration complete. Updated ${updated} entries.`);
  await mongoose.disconnect();
  process.exit(0);
}

run(databaseUrl).catch((err) => {
  console.error(err);
  process.exit(1);
});
