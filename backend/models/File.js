import mongoose from "mongoose";

const filePermissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    level: {
      type: String,
      enum: ["read", "write"],
      default: "read"
    }
  },
  { _id: false }
);

const fileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    safeName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    storagePath: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sharedWith: [filePermissionSchema],
    encryptedDek: { type: String, required: true },
    encryptionIv: { type: String, required: true },
    encryptionAuthTag: { type: String, required: true },
    encryptionStatus: {
      type: String,
      enum: ["encrypted"],
      default: "encrypted"
    },
    lastAccessedAt: { type: Date, default: null },
    lastModifiedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const File = mongoose.model("File", fileSchema);
export default File;
