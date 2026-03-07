import mongoose from 'mongoose';

async function fixDb() {
  await mongoose.connect('mongodb://127.0.0.1/clinerva');
  const db = mongoose.connection.db;
  
  const users = await db.collection('users').find().toArray();
  for (const u of users) {
    console.log(`Checking patients for user: ${u.name}`);
    // If the patient was created without a userId, let's map it based on something, or just assign it to the first found patient without a userId
    const updateResult = await db.collection('patients').updateMany(
      { userId: { $exists: false } }, 
      { $set: { userId: u._id } }
    );
    console.log(`Fixed ${updateResult.modifiedCount} orphan patients and assigned to ${u._id}`);
  }
  
  const remaining = await db.collection('patients').countDocuments({ userId: { $exists: false } });
  console.log(`Remaining orphans: ${remaining}`);
  
  await mongoose.disconnect();
}

fixDb().catch(console.error);
