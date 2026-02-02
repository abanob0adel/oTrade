import Psychology from './psychology.model.js';
import mongoose from 'mongoose';
import connectDB from '../../config/db.js'; // Adjust path to your DB config

/**
 * Safe debugging procedure for Psychology.findById returning null
 * This function checks all possible causes without modifying any data
 */
export const debugPsychologyFindById = async (id) => {
  console.log('\n========== PSYCHOLOGY FIND BY ID DEBUG ==========');
  console.log('Input ID:', id);
  console.log('Input ID type:', typeof id);
  
  // Step 1: Check if ID is correctly formatted
  console.log('\n--- STEP 1: ID FORMAT CHECK ---');
  let objectId;
  
  if (typeof id === 'string') {
    console.log('ID is string format, checking validity...');
    if (mongoose.Types.ObjectId.isValid(id)) {
      console.log('✓ Valid ObjectId string format');
      objectId = new mongoose.Types.ObjectId(id);
    } else {
      console.log('✗ Invalid ObjectId string format');
      console.log('ID length:', id.length);
      console.log('ID characters:', /^[0-9a-fA-F]{24}$/.test(id) ? 'Valid hex chars' : 'Invalid hex chars');
      return null;
    }
  } else if (id instanceof mongoose.Types.ObjectId) {
    console.log('✓ Already an ObjectId instance');
    objectId = id;
  } else {
    console.log('✗ Unexpected ID type:', typeof id);
    return null;
  }
  
  console.log('Processed ObjectId:', objectId);
  console.log('Processed ObjectId toString():', objectId.toString());
  
  // Step 2: Check database connection
  console.log('\n--- STEP 2: DATABASE CONNECTION CHECK ---');
  if (!mongoose.connection.readyState) {
    console.log('✗ Database not connected, attempting connection...');
    try {
      await connect(); // Use your DB connection function
      console.log('✓ Database connected successfully');
    } catch (error) {
      console.log('✗ Failed to connect to database:', error.message);
      return null;
    }
  } else {
    console.log('✓ Database is connected');
    console.log('Connection readyState:', mongoose.connection.readyState); // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  }
  
  // Step 3: Check collection name
  console.log('\n--- STEP 3: COLLECTION NAME VERIFICATION ---');
  const modelName = Psychology.modelName;
  const collectionName = Psychology.collection.collectionName;
  console.log('Model name:', modelName);
  console.log('Collection name:', collectionName);
  console.log('Expected collection name (pluralized):', mongoose.pluralize()(modelName));
  
  // Step 4: Print all documents in collection to confirm data exists
  console.log('\n--- STEP 4: COLLECTION CONTENTS ---');
  try {
    const allDocs = await Psychology.find({});
    console.log(`Total documents in collection: ${allDocs.length}`);
    
    if (allDocs.length > 0) {
      console.log('Sample of documents (first 5):');
      for (let i = 0; i < Math.min(5, allDocs.length); i++) {
        const doc = allDocs[i];
        console.log(`  Doc ${i + 1}:`);
        console.log(`    _id: ${doc._id} (type: ${typeof doc._id})`);
        console.log(`    key: ${doc.key}`);
        console.log(`    isFree: ${doc.isFree}`);
        console.log(`    isActive: ${doc.isActive}`); // New field we added
      }
      
      // Check if our specific ID exists in the collection
      const targetDoc = allDocs.find(doc => 
        doc._id.toString() === id || 
        (doc._id.equals && doc._id.equals(objectId))
      );
      
      if (targetDoc) {
        console.log('\n✓ Target document FOUND in collection!');
        console.log('Document details:');
        console.log('  _id:', targetDoc._id, '(type:', typeof targetDoc._id, ')');
        console.log('  _id equals search ID:', targetDoc._id.equals ? targetDoc._id.equals(objectId) : 'N/A');
        console.log('  _id toString():', targetDoc._id.toString());
        console.log('  key:', targetDoc.key);
        console.log('  isFree:', targetDoc.isFree);
        console.log('  isActive:', targetDoc.isActive);
        console.log('  plans:', targetDoc.plans);
        console.log('  createdAt:', targetDoc.createdAt);
        console.log('  updatedAt:', targetDoc.updatedAt);
      } else {
        console.log('\n✗ Target document NOT FOUND in collection');
        console.log('Searched for ID:', id);
        console.log('Available IDs in collection:');
        allDocs.slice(0, 10).forEach((doc, idx) => {
          console.log(`  ${idx + 1}. ${doc._id.toString()} (key: ${doc.key})`);
        });
        if (allDocs.length > 10) {
          console.log('  ... and', allDocs.length - 10, 'more documents');
        }
      }
    } else {
      console.log('✗ Collection is EMPTY!');
    }
  } catch (error) {
    console.log('✗ Error fetching all documents:', error.message);
  }
  
  // Step 5: Try various find methods
  console.log('\n--- STEP 5: TESTING VARIOUS FIND METHODS ---');
  
  // Method 1: findById
  try {
    const result1 = await Psychology.findById(objectId);
    console.log('findById result:', result1 ? 'FOUND' : 'NULL');
  } catch (error) {
    console.log('findById ERROR:', error.message);
  }
  
  // Method 2: findOne with _id
  try {
    const result2 = await Psychology.findOne({ _id: objectId });
    console.log('findOne(_id: ObjectId) result:', result2 ? 'FOUND' : 'NULL');
  } catch (error) {
    console.log('findOne(_id: ObjectId) ERROR:', error.message);
  }
  
  // Method 3: findOne with _id as string
  try {
    const result3 = await Psychology.findOne({ _id: id });
    console.log('findOne(_id: string) result:', result3 ? 'FOUND' : 'NULL');
  } catch (error) {
    console.log('findOne(_id: string) ERROR:', error.message);
  }
  
  // Method 4: findOne with string conversion
  try {
    const result4 = await Psychology.findOne({ _id: new mongoose.Types.ObjectId(id) });
    console.log('findOne(new ObjectId(string)) result:', result4 ? 'FOUND' : 'NULL');
  } catch (error) {
    console.log('findOne(new ObjectId(string)) ERROR:', error.message);
  }
  
  // Step 6: Check for any query middleware/hooks
  console.log('\n--- STEP 6: QUERY MIDDLEWARE/HOOKS CHECK ---');
  const schema = Psychology.schema;
  console.log('Schema query middleware:');
  console.log('  - pre find hooks:', schema.s.hooks?._pres?.get('find')?.length || 0);
  console.log('  - pre findOne hooks:', schema.s.hooks?._pres?.get('findOne')?.length || 0);
  console.log('  - pre findById hooks:', schema.s.hooks?._pres?.get('findById')?.length || 0);
  console.log('  - post find hooks:', schema.s.hooks?._posts?.get('find')?.length || 0);
  console.log('  - post findOne hooks:', schema.s.hooks?._posts?.get('findOne')?.length || 0);
  console.log('  - post findById hooks:', schema.s.hooks?._posts?.get('findById')?.length || 0);
  
  // Step 7: Check if there are any query conditions that might filter out the document
  console.log('\n--- STEP 7: POTENTIAL FILTER CONDITIONS ---');
  // Check for any static query conditions that might be applied
  console.log('Checking for common filter conditions that might exclude documents...');
  
  // Test if document might be filtered by isActive field (which we recently added)
  try {
    const allDocs = await Psychology.find({}).lean();
    const hasInactiveField = allDocs.some(doc => doc.hasOwnProperty('isActive'));
    console.log('Documents have isActive field:', hasInactiveField);
    
    if (hasInactiveField) {
      const activeDocs = await Psychology.find({ isActive: true });
      const inactiveDocs = await Psychology.find({ isActive: false });
      console.log('Active documents count:', activeDocs.length);
      console.log('Inactive documents count:', inactiveDocs.length);
      
      // Check if our target might be inactive
      const targetInactive = await Psychology.findOne({ _id: objectId, isActive: false });
      if (targetInactive) {
        console.log('⚠️  TARGET DOCUMENT IS INACTIVE! This might explain the null result in some contexts.');
      }
    }
  } catch (error) {
    console.log('Error checking isActive filter:', error.message);
  }
  
  console.log('\n========== DEBUG COMPLETE ==========\n');
};

// Helper function to run debug with multiple IDs
export const debugMultiplePsychologyIds = async (ids) => {
  console.log('\n========== DEBUGGING MULTIPLE PSYCHOLOGY IDS ==========');
  for (const id of ids) {
    console.log(`\n--- Debugging ID: ${id} ---`);
    await debugPsychologyFindById(id);
  }
  console.log('\n========== MULTIPLE DEBUG COMPLETE ==========\n');
};