import mongoose from "mongoose";

const sharedLinkSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true
    },
    tokenHash: {
      type: String,
      required: true
    },
    permission: {
      type: String,
      enum: ["read"],
      default: "read"
    },
    expiresAt: {
      type: Date,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isRevoked: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const SharedLink = mongoose.model("SharedLink", sharedLinkSchema);
export default SharedLink;
