const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectDB = require('../config/db');
const TechnicalQuestion = require('../models/TechnicalQuestion');
const HRQuestion = require('../models/HRQuestion');

const TECH_JSON_PATH = path.join(__dirname, '..', '..', 'public', 'interview_questions_combined.json');
const HR_JSON_PATH = path.join(__dirname, '..', '..', 'public', 'hr_questions_company_wise.json');

async function seed() {
  console.log('\n🌱 CMRIT Placement Database Seeder\n');
  console.log('─'.repeat(50));

  try {
    // Connect to MongoDB
    await connectDB();

    // Check for --force flag to clear existing data
    const forceFlag = process.argv.includes('--force');

    // ── Seed Technical Questions ──
    console.log('\n📖 Reading technical questions JSON...');
    const techRaw = fs.readFileSync(TECH_JSON_PATH, 'utf-8');
    const techData = JSON.parse(techRaw);
    console.log(`   Found ${techData.length} technical entries`);

    if (forceFlag) {
      console.log('   ⚠️  --force flag detected, clearing existing technical data...');
      await TechnicalQuestion.deleteMany({});
    }

    const existingTechCount = await TechnicalQuestion.countDocuments();
    if (existingTechCount > 0 && !forceFlag) {
      console.log(`   ℹ️  ${existingTechCount} entries already exist. Use --force to overwrite.`);
    } else {
      const techResult = await TechnicalQuestion.insertMany(techData, { ordered: false }).catch(err => {
        if (err.code === 11000) {
          console.log('   ⚠️  Some duplicate entries were skipped');
          return err.insertedDocs || [];
        }
        throw err;
      });
      const insertedCount = Array.isArray(techResult) ? techResult.length : techData.length;
      console.log(`   ✅ Inserted ${insertedCount} technical entries`);
    }

    // ── Seed HR Questions ──
    console.log('\n💬 Reading HR questions JSON...');
    const hrRaw = fs.readFileSync(HR_JSON_PATH, 'utf-8');
    const hrData = JSON.parse(hrRaw);
    console.log(`   Found ${hrData.length} HR entries`);

    if (forceFlag) {
      console.log('   ⚠️  --force flag detected, clearing existing HR data...');
      await HRQuestion.deleteMany({});
    }

    const existingHrCount = await HRQuestion.countDocuments();
    if (existingHrCount > 0 && !forceFlag) {
      console.log(`   ℹ️  ${existingHrCount} entries already exist. Use --force to overwrite.`);
    } else {
      const hrResult = await HRQuestion.insertMany(hrData, { ordered: false }).catch(err => {
        if (err.code === 11000) {
          console.log('   ⚠️  Some duplicate entries were skipped');
          return err.insertedDocs || [];
        }
        throw err;
      });
      const insertedCount = Array.isArray(hrResult) ? hrResult.length : hrData.length;
      console.log(`   ✅ Inserted ${insertedCount} HR entries`);
    }

    // ── Summary ──
    console.log('\n' + '─'.repeat(50));
    const finalTechCount = await TechnicalQuestion.countDocuments();
    const finalHrCount = await HRQuestion.countDocuments();
    console.log(`\n📊 Database Summary:`);
    console.log(`   Technical entries: ${finalTechCount}`);
    console.log(`   HR entries:        ${finalHrCount}`);
    console.log(`   Total entries:     ${finalTechCount + finalHrCount}`);
    console.log('\n✅ Seeding complete!\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

seed();
