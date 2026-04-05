import asyncHandler from "../utils/asyncHandler.js";

export const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});
