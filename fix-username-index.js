/**
 * 🔧 Fix Username Index Issue
 * 
 * Problem: E11000 duplicate key error on username_1 index
 * Solution: Drop the old username index from database
 * 
 * Run: node fix-username-index.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

async function fixUsernameIndex() {
  try {
    console.log('🔧 Fixing username index issue...\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // List all indexes
    console.log('📋 Current indexes:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(index => {
      console.log(`   - ${JSON.stringify(index.key)} (${index.name})`);
    });
    console.log('');
    
    // Check if username_1 index exists
    const hasUsernameIndex = indexes.some(index => index.name === 'username_1');
    
    if (hasUsernameIndex) {
      console.log('🗑️  Dropping username_1 index...');
      await usersCollection.dropIndex('username_1');
      console.log('✅ username_1 index dropped successfully\n');
    } else {
      console.log('ℹ️  username_1 index not found (already removed)\n');
    }
    
    // List indexes after fix
    console.log('📋 Indexes after fix:');
    const newIndexes = await usersCollection.indexes();
    newIndexes.forEach(index => {
      console.log(`   - ${JSON.stringify(index.key)} (${index.name})`);
    });
    console.log('');
    
    console.log('✅ Fix completed successfully!');
    console.log('You can now register users without username field.\n');
    
    // Close connection
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixUsernameIndex();
