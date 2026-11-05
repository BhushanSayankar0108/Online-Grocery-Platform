const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      maxlength: 150,
      unique: true,
    },

    status: {
      type: String,
      enum: ["Subscribed", "Unsubscribed"],
      default: "Subscribed",
    },
  },
  {
    timestamps: true,
  }
);

newsletterSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Newsletter", newsletterSchema);