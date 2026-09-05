require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vpmh').then(async () => {
  const db = mongoose.connection.db;
  
  // Search for the user with this specific UUID in their photo or documentProof
  const uuid = "8415d59e-7708-452a-908b-d209ecd2072b";
  const user = await db.collection('users').findOne({
    $or: [
      { photo: { $regex: uuid } },
      { documentProof: { $regex: uuid } }
    ]
  });
  
  if (!user) {
    console.log("No user found with that UUID in photo or documentProof");
  } else {
    console.log("User found!");
    console.log("Name:", user.name);
    console.log("Photo:", user.photo);
    console.log("Document Proof:", user.documentProof);
  }
  
  process.exit(0);
}).catch(console.error);
