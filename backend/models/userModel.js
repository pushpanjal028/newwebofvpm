// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String },
//     phone: { type: String },
//     organization: { type: String },
//   },
//   { timestamps: true }
// );

// // ✅ Prevent OverwriteModelError
// const User = mongoose.models.User || mongoose.model("User", userSchema);

// export default User;
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // existing
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    organization: { type: String },

    // 🔹 NEW: Profile photo
    photo: { type: String }, // Cloudinary URL

    // 🔹 Membership
    membershipFee: { type: Number, default: 99 },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    paymentId: { type: String },
    orderId: { type: String },

    // 🔹 Admin approval (future-safe)
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // 🔹 Admin
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
