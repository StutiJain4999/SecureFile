import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    action: { type: String, required: true },
    status: {
      type: String,
      enum: ["success", "failure", "warning"],
      default: "success"
    },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    targetType: { type: String, default: null },
    targetId: { type: String, default: null },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
