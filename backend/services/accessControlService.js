import ApiError from "../utils/ApiError.js";

export const resolveFilePermission = (file, user) => {
  if (user.role === "admin") {
    return "write";
  }

  if (file.owner.toString() === user._id.toString()) {
    return "write";
  }

  const sharedRecord = file.sharedWith.find(
    (entry) => entry.user.toString() === user._id.toString()
  );

  return sharedRecord?.level ?? null;
};

export const ensureFilePermission = (file, user, requiredLevel = "read") => {
  const permission = resolveFilePermission(file, user);
  if (!permission) {
    throw new ApiError(403, "No permission for this file");
  }

  if (requiredLevel === "write" && permission !== "write") {
    throw new ApiError(403, "Write access is required");
  }
};
