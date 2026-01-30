"use strict";
/**
 * Migration: Add content field to existing QuranEntry test objects.
 * Sets content.type = 'custom' and content.customDescription = existing note
 * for newTest, recentTest, olderTest when content is missing.
 *
 * Run: npx ts-node scripts/migrate-quran-entry-content.ts
 * (from backend directory; ensure .env and database_url are set)
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
// Load .env from backend root
dotenv_1.default.config({ path: path_1.default.join(__dirname, '..', '.env') });
const databaseUrl = process.env.database_url;
if (!databaseUrl) {
    console.error('Missing database_url in .env');
    process.exit(1);
}
function run(url) {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(url);
        // Use raw collection to avoid schema defaults overwriting; or use model with strict:false
        const db = mongoose_1.default.connection.db;
        if (!db) {
            console.error('No database connection');
            process.exit(1);
        }
        const collection = db.collection('quranentries');
        const cursor = collection.find({});
        let updated = 0;
        while (yield cursor.hasNext()) {
            const doc = yield cursor.next();
            if (!doc)
                continue;
            const update = {};
            let needsUpdate = false;
            for (const key of ['newTest', 'recentTest', 'olderTest']) {
                const test = doc[key];
                if (!test || typeof test !== 'object')
                    continue;
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
                yield collection.updateOne({ _id: doc._id }, { $set: update });
                updated += 1;
            }
        }
        console.log(`Migration complete. Updated ${updated} entries.`);
        yield mongoose_1.default.disconnect();
        process.exit(0);
    });
}
run(databaseUrl).catch((err) => {
    console.error(err);
    process.exit(1);
});
