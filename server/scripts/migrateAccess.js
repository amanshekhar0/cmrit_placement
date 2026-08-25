/**
 * One-off migration: NotesAccess -> Access.
 *
 * Every existing notes buyer becomes an Access doc with product 'notes' and
 * expiresAt: null, so they keep the lifetime access they actually paid for.
 * The ₹99 bundle is a separate product and is never backfilled here.
 *
 * Safe to re-run: existing (email, product) pairs are skipped, not overwritten.
 *
 *   node server/scripts/migrateAccess.js          # dry run, prints the plan
 *   node server/scripts/migrateAccess.js --commit # actually writes
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Access = require('../models/Access');

const COMMIT = process.argv.includes('--commit');

// Read the legacy collection directly rather than through the old model, which
// may be deleted once this migration has run everywhere.
async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(uri);

  const legacy = await mongoose.connection.db
    .collection('notesaccesses')
    .find({})
    .toArray();

  console.log(`Found ${legacy.length} legacy notes grant(s).`);

  let created = 0;
  let skipped = 0;

  for (const doc of legacy) {
    const email = String(doc.email || '').toLowerCase();
    if (!email) {
      console.warn('  ! skipping doc with no email:', doc._id);
      continue;
    }

    const exists = await Access.findOne({ email, product: 'notes' });
    if (exists) {
      skipped++;
      continue;
    }

    const payload = {
      email,
      product: 'notes',
      grantedVia: doc.grantedVia === 'manual' ? 'manual' : 'payment',
      expiresAt: null, // lifetime: they bought before the pass existed
      paymentId: doc.paymentId,
      orderId: doc.orderId,
      grantedBy: doc.grantedBy,
      token: doc.token,
      purchaseCount: 1,
      // Preserve this so the migration does not re-send old purchase emails.
      welcomeEmailSent: doc.welcomeEmailSent !== false,
      createdAt: doc.createdAt,
    };

    console.log(`  + ${email} (via ${payload.grantedVia})`);
    if (COMMIT) await Access.create(payload);
    created++;
  }

  console.log(
    COMMIT
      ? `\nDone. Created ${created}, skipped ${skipped} already-migrated.`
      : `\nDRY RUN. Would create ${created}, skip ${skipped}. Re-run with --commit to apply.`
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
