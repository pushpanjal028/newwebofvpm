import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";

// Load test environment explicitly
dotenv.config({ path: ".env.test" });

import User from "../src/models/User.js";

const generateCoordinatorCode = () => {
  return "VPMH-" + crypto.randomBytes(3).toString("hex").toUpperCase();
};

const runMigration = async () => {
  console.log("Starting Coordinator Code Migration...");
  console.log("Database URI:", process.env.MONGO_URI);

  if (!process.env.MONGO_URI.includes("test")) {
    console.error("❌ ABORTING: MONGO_URI does not appear to be a test database.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Create 3 fake users if the DB is empty (for testing the migration)
    const count = await User.countDocuments();
    if (count === 0) {
      console.log("Test DB is empty. Creating sample users...");
      await User.create([
        { name: "Test User 1", email: "test1@example.com", password: "pwd" },
        { name: "Test User 2", email: "test2@example.com", password: "pwd", coordinatorCode: "VPMH-ALREADY1" },
        { name: "Test User 3", email: "test3@example.com", password: "pwd" },
      ]);
      console.log("Created sample users.");
    }

    // Find users who DO NOT have a coordinatorCode
    const usersToMigrate = await User.find({
      $or: [
        { coordinatorCode: { $exists: false } },
        { coordinatorCode: null },
        { coordinatorCode: "" },
      ],
    });

    console.log(`Found ${usersToMigrate.length} users requiring a coordinator code.`);

    let successCount = 0;
    let failCount = 0;

    for (const user of usersToMigrate) {
      let migrated = false;
      let attempts = 0;
      
      while (!migrated && attempts < 5) {
        attempts++;
        const newCode = generateCoordinatorCode();
        try {
          // Use atomic update to prevent overriding anything else
          const result = await User.updateOne(
            { _id: user._id, $or: [{ coordinatorCode: { $exists: false } }, { coordinatorCode: null }, { coordinatorCode: "" }] },
            { $set: { coordinatorCode: newCode } }
          );
          
          if (result.modifiedCount > 0) {
            migrated = true;
            successCount++;
            console.log(`Migrated user ${user._id} with code ${newCode}`);
          } else {
            console.log(`User ${user._id} already migrated concurrently.`);
            migrated = true; // Breaking the loop if it was concurrently migrated
          }
        } catch (error) {
          if (error.code === 11000) {
            console.log(`Collision for code ${newCode}, retrying...`);
            // retry loop continues
          } else {
            console.error(`Error migrating user ${user._id}:`, error);
            failCount++;
            break;
          }
        }
      }
    }

    console.log("\nMigration Complete.");
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Failed: ${failCount}`);

    // Fetch sample to demonstrate before/after
    const sampleUsers = await User.find().select("name email coordinatorCode");
    console.log("\nSample User Structure After Migration:");
    console.log(JSON.stringify(sampleUsers, null, 2));

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
};

runMigration();
