require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vpmh').then(async () => {
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ photo: { $ne: null } });
  
  if (!user) {
    console.log("No user with photo found.");
    process.exit(0);
  }
  console.log("User photo:", user.photo);
