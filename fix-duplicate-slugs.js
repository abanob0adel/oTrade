import mongoose from 'mongoose';
import 'dotenv/config';

/**
 * Fix Duplicate Slugs in Strategies Collection
 * 
 * This script finds strategies with duplicate slugs and fixes them
 * by appending a timestamp to make them unique.
 */

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Strategy Model
const strategySchema = new mongoose.Schema({
  isFree: Boolean,
  plans: [String],
  coverImageUrl: String,
  videoUrl: String,
  isPaid: Boolean,
  isInSubscription: Boolean,
  slug: {
    type: String,
    unique: true,
    sparse: true
  }
}, { timestamps: true });

const Strategy = mongoose.model('Strategy', strategySchema);

/**
 * Find and fix duplicate slugs
 */
async function fixDuplicateSlugs() {
  try {
    console.log('\n===== Finding Duplicate Slugs =====\n');

    // Find all strategies with slugs
    const strategies = await Strategy.find({ slug: { $exists: true, $ne: null } });
    
    console.log(`Found ${strategies.length} strategies with slugs`);

    // Group by slug to find duplicates
    const slugMap = {};
    
    strategies.forEach(strategy => {
      if (!slugMap[strategy.slug]) {
        slugMap[strategy.slug] = [];
      }
      slugMap[strategy.slug].push(strategy);
    });

    // Find duplicates
    const duplicates = Object.entries(slugMap).filter(([slug, strategies]) => strategies.length > 1);

    if (duplicates.length === 0) {
      console.log('✓ No duplicate slugs found!');
      return;
    }

    console.log(`\n✗ Found ${duplicates.length} duplicate slug(s):\n`);

    // Fix each duplicate
    for (const [slug, strategies] of duplicates) {
      console.log(`\nSlug: "${slug}" (${strategies.length} duplicates)`);
      
      // Keep the first one, fix the rest
      for (let i = 1; i < strategies.length; i++) {
        const strategy = strategies[i];
        const newSlug = `${slug}-${Date.now()}-${i}`;
        
        console.log(`  - Updating strategy ${strategy._id}`);
        console.log(`    Old slug: ${strategy.slug}`);
        console.log(`    New slug: ${newSlug}`);
        
        strategy.slug = newSlug;
        await strategy.save();
        
        console.log(`    ✓ Updated successfully`);
      }
    }

    console.log('\n✓ All duplicate slugs fixed!');

  } catch (error) {
    console.error('\n✗ Error fixing duplicate slugs:', error);
    throw error;
  }
}

/**
 * List all strategies with their slugs
 */
async function listAllStrategies() {
  try {
    console.log('\n===== All Strategies =====\n');

    const strategies = await Strategy.find({}).select('_id slug isFree createdAt');
    
    if (strategies.length === 0) {
      console.log('No strategies found');
      return;
    }

    console.log(`Total strategies: ${strategies.length}\n`);

    strategies.forEach((strategy, index) => {
      console.log(`${index + 1}. ID: ${strategy._id}`);
      console.log(`   Slug: ${strategy.slug || '(no slug)'}`);
      console.log(`   Free: ${strategy.isFree ? 'Yes' : 'No'}`);
      console.log(`   Created: ${strategy.createdAt?.toISOString() || 'N/A'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error listing strategies:', error);
    throw error;
  }
}

/**
 * Remove strategies with specific slug (for testing)
 */
async function removeStrategiesBySlug(slug) {
  try {
    console.log(`\n===== Removing strategies with slug: "${slug}" =====\n`);

    const result = await Strategy.deleteMany({ slug });
    
    console.log(`✓ Removed ${result.deletedCount} strategy(ies)`);

  } catch (error) {
    console.error('Error removing strategies:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    await connectDB();

    // Get command line arguments
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'list') {
      await listAllStrategies();
    } else if (command === 'remove' && args[1]) {
      await removeStrategiesBySlug(args[1]);
    } else {
      // Default: fix duplicates
      await fixDuplicateSlugs();
      console.log('\n===== Verification =====\n');
      await listAllStrategies();
    }

    console.log('\n✓ Done!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n✗ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
