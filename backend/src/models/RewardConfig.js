import mongoose from "mongoose";

const rewardConfigSchema = new mongoose.Schema(
  {
    requiredReferrals: {
      type: Number,
      default: 10,
    },
    grossCashback: {
      type: Number,
      default: 200,
    },
    processingFee: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const RewardConfig = mongoose.models.RewardConfig || mongoose.model("RewardConfig", rewardConfigSchema);
export default RewardConfig;
