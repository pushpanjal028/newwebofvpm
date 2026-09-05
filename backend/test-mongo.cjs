const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/vpmh').then(async () => {
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ photo: { $ne: null } });
  console.log('User photo:', user ? user.photo : 'no users with photo');
  
  // Test regex search
  if (user && user.photo) {
    const key = "temp/registration/"; // just a prefix test
    const found = await db.collection('users').findOne({ photo: { $regex: key, $options: 'i' } });
    console.log('Regex found:', !!found);
    
    // Exact test from backend
    // Simulate what client.ts sends
    let url = user.photo;
    let parsedKey = url;
    if (url.includes(".amazonaws.com/")) {
      parsedKey = url.split(".amazonaws.com/")[1];
    } else if (url.startsWith("s3://")) {
      const parts = url.replace("s3://", "").split("/");
      parsedKey = parts.slice(1).join("/");
    }
    console.log('Parsed Key:', parsedKey);
    
    const owner = await db.collection('users').findOne({ photo: { $regex: parsedKey + "$", $options: "i" } });
    console.log('Owner found by parsed key + $:', !!owner);
  }

  process.exit(0);
}).catch(console.error);
