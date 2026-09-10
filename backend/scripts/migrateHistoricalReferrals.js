import mongoose from "mongoose";
import dotenv from "dotenv";

// Support both .env and .env.test depending on how it's called
dotenv.config();

import User from "../src/models/User.js";
import Referral from "../src/models/Referral.js";
import Cashback from "../src/models/Cashback.js";

const runMigration = async () => {
  const isPreview = process.argv.includes("--preview");

  console.log("==========================================");
  console.log("  HISTORICAL REFERRAL MIGRATION SCRIPT  ");
  console.log("==========================================");
  
  if (isPreview) {
    console.log("🛠️  RUNNING IN PREVIEW MODE (DRY-RUN)");
    console.log("No database records will be modified.");
  } else {
    console.log("⚠️  RUNNING IN EXECUTION MODE");
    console.log("Database records WILL be created.");
  }
  console.log("------------------------------------------\n");

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables.");
    }
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // 1. Fetch all existing users to build stats
    const totalExistingMembers = await User.countDocuments();

    // Find users who were referred by someone (have referredBy field)
    const referredUsers = await User.find({
      referredBy: { $exists: true, $ne: null }
    }).populate("referredBy", "coordinatorCode");

    let historicalReferralsFound = 0;
    let automaticallyVerified = 0;
    let needsAdminReview = 0;
    let skippedExisting = 0;

    const coordinatorsToProcess = new Set(); // Track coordinators who had backfilled referrals

    console.log(`\nFound ${referredUsers.length} users with historical referral data. Analyzing...\n`);

    for (const user of referredUsers) {
      historicalReferralsFound++;
      
      const coordinatorId = user.referredBy._id;
      const coordinatorCode = user.referredBy.coordinatorCode || "UNKNOWN_CODE";

      // Idempotency check: See if this referral relationship already exists
      const existingReferral = await Referral.findOne({
        referredUserId: user._id,
        coordinatorId: coordinatorId
      });

      if (existingReferral) {
        skippedExisting++;
        continue;
      }

      // Determine Historical Referral Status based on current membership status
      let referralStatus = "pending";
      let eligibleAt = undefined;
      
      if (user.approvalStatus === "approved") {
        referralStatus = "eligible";
        eligibleAt = user.updatedAt; // Approximate date of eligibility
        automaticallyVerified++;
      } else {
        needsAdminReview++;
      }

      const paymentStatus = user.paymentStatus === "paid" ? "paid" : "pending";

      const referralData = {
        coordinatorId: coordinatorId,
        referredUserId: user._id,
        coordinatorCodeUsed: coordinatorCode,
        status: referralStatus,
        paymentStatus: paymentStatus,
        isHistorical: true,
        source: "historical_database",
        eligibleAt: eligibleAt,
        // Preserve original registration date if possible
        createdAt: user.createdAt,
      };

      if (!isPreview) {
        await Referral.create(referralData);
      }

      coordinatorsToProcess.add(coordinatorId.toString());
    }

    console.log("\n--- Evaluating Historical Cashbacks ---\n");

    let historicalCashbacksFound = 0;
    let cashbacksAlreadyPaid = 0;

    // 2. Evaluate Cashbacks for affected coordinators
    for (const coordinatorIdStr of coordinatorsToProcess) {
      // Get ALL eligible referrals (historical + new)
      // If we're in preview, we must simulate the new total by querying existing + what we *would* insert
      let totalEligible = 0;
      
      if (!isPreview) {
        totalEligible = await Referral.countDocuments({
          coordinatorId: coordinatorIdStr,
          status: "eligible"
        });
      } else {
        // Count existing eligible
        const existingEligible = await Referral.countDocuments({
          coordinatorId: coordinatorIdStr,
          status: "eligible"
        });
        
        // Count the ones we *would* have added as eligible
        const simulatedEligible = referredUsers.filter(u => 
          u.referredBy._id.toString() === coordinatorIdStr &&
          u.approvalStatus === "approved"
        ).length;
        
        totalEligible = existingEligible + simulatedEligible;
      }

      // VPMH Milestone Rules
      const threshold = 10;
      const grossAmount = 500;
      const processingFee = 100;
      const netAmount = 400;

      // Ensure they hit the milestone
      if (totalEligible >= threshold) {
        // Idempotency check: see if they already have a cashback for this threshold
        const existingCashback = await Cashback.findOne({
          coordinatorId: coordinatorIdStr,
          threshold: threshold
        });

        if (existingCashback) {
          cashbacksAlreadyPaid++;
        } else {
          historicalCashbacksFound++;
          
          if (!isPreview) {
            await Cashback.create({
              coordinatorId: coordinatorIdStr,
              referralCount: totalEligible,
              threshold: threshold,
              grossAmount: grossAmount,
              processingFee: processingFee,
              netAmount: netAmount,
              status: "eligible", // Eligible means pending admin review
              isHistorical: true,
            });
          }
        }
      }
    }

    // --- Generate Output Report ---
    console.log("==========================================");
    console.log("   HISTORICAL REFERRAL MIGRATION REPORT   ");
    console.log("==========================================");
    console.log(`Total Existing Members: ${totalExistingMembers}`);
    console.log(`Historical Referrals Found: ${historicalReferralsFound}`);
    console.log(`Already Existed (Skipped): ${skippedExisting}`);
    console.log(`Automatically Verified (Eligible): ${automaticallyVerified}`);
    console.log(`Needs Admin Review (Pending): ${needsAdminReview}`);
    console.log(`Unable to Determine: 0 (Strict Attribution Enforced)`);
    console.log("------------------------------------------");
    console.log(`Historical Cashbacks Candidates: ${historicalCashbacksFound}`);
    console.log(`Cashbacks Already Existed (Skipped): ${cashbacksAlreadyPaid}`);
    console.log("==========================================");

    if (isPreview) {
      console.log("\n💡 Run without '--preview' to execute this migration safely.");
    } else {
      console.log("\n✅ Migration executed successfully.");
    }

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
};

runMigration();
