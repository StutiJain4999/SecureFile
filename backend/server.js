import dotenv from "dotenv";
import app from "./app.js";
import connectDb from "./config/db.js";
import { ensureStorageDirectories } from "./security/encryptionService.js";
import { seedAdminAccount } from "./services/userService.js";

dotenv.config();

const port = Number(process.env.PORT || 5000);

const start = async () => {
  await connectDb();
  await ensureStorageDirectories();
  await seedAdminAccount();

  app.listen(port, () => {
    console.log(`Secure File Management API listening on port ${port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
