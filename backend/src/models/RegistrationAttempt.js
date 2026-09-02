import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema({
  attemptId: {
    type: String,
    required: true,
    unique: true,
  },
  keys: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Automatically delete abandoned attempts after 24 hours (86400 seconds)
  },
});

const RegistrationAttempt = mongoose.models.RegistrationAttempt || mongoose.model("RegistrationAttempt", attemptSchema);
export default RegistrationAttempt;
