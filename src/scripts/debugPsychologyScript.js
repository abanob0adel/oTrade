import { debugPsychologyFindById } from '../modules/psychology/debugPsychology.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

// Example usage of the debug function
const runDebug = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Example ID that was mentioned in the original query
    const problematicId = '696e12ec2e4b78bbc51d0f0d';
    
    console.log('Starting debug for Psychology ID:', problematicId);
    
    // Run the debug function
    const result = await debugPsychologyFindById(problematicId);
    
    if (result === null) {
      console.log('\nDebug completed. Check the logs above for potential issues.');
    }
    
    // Close the connection after debugging
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error running debug script:', error);
  }
};

// Run the debug if this file is executed directly
if (process.argv[1].endsWith('debugPsychologyScript.js')) {
  runDebug().catch(console.error);
}

export { runDebug };