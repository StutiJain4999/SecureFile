import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import ApiError from "../utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getStorageRoot = () =>
  path.resolve(__dirname, "..", process.env.FILE_STORAGE_PATH || "./storage/files");

const getMasterKey = () => {
  const value = process.env.MASTER_ENCRYPTION_KEY_HEX;
  if (!value) {
    throw new Error("MASTER_ENCRYPTION_KEY_HEX is not configured");
  }

  const buffer = Buffer.from(value, "hex");
  if (buffer.length !== 32) {
    throw new Error("MASTER_ENCRYPTION_KEY_HEX must decode to 32 bytes");
  }

  return buffer;
};

export const ensureStorageDirectories = async () => {
  await fs.mkdir(getStorageRoot(), { recursive: true });
};

const encryptDek = (dek) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getMasterKey(), iv);
  const encrypted = Buffer.concat([cipher.update(dek), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
};

const decryptDek = (payload) => {
  const buffer = Buffer.from(payload, "base64");
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getMasterKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};

export const encryptAndPersistFile = async ({ buffer, ownerId }) => {
  const dek = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", dek, iv);
  const encryptedBuffer = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const safeName = `${Date.now()}-${crypto.randomUUID()}`;
  const storagePath = path.join(getStorageRoot(), ownerId.toString(), safeName);

  await fs.mkdir(path.dirname(storagePath), { recursive: true });
  await fs.writeFile(storagePath, encryptedBuffer);

  return {
    safeName,
    storagePath,
    encryptedDek: encryptDek(dek),
    encryptionIv: iv.toString("base64"),
    encryptionAuthTag: authTag.toString("base64"),
    encryptionStatus: "encrypted"
  };
};

export const decryptFileToBuffer = async (fileRecord) => {
  try {
    const encryptedBuffer = await fs.readFile(fileRecord.storagePath);
    const dek = decryptDek(fileRecord.encryptedDek);
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      dek,
      Buffer.from(fileRecord.encryptionIv, "base64")
    );
    decipher.setAuthTag(Buffer.from(fileRecord.encryptionAuthTag, "base64"));
    return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
  } catch (error) {
    throw new ApiError(500, "Unable to decrypt file", error.message);
  }
};

export const replaceEncryptedFile = async (fileRecord, buffer) => {
  const dek = decryptDek(fileRecord.encryptedDek);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", dek, iv);
  const encryptedBuffer = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  await fs.writeFile(fileRecord.storagePath, encryptedBuffer);

  return {
    encryptionIv: iv.toString("base64"),
    encryptionAuthTag: authTag.toString("base64")
  };
};
