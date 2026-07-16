import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  region: process.env.AWS_REGION || "us-east-1",
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";

/**
 * Generates a presigned PUT URL for client-side uploads directly to S3.
 * @param {string} key - The S3 object key (path inside the bucket).
 * @param {string} contentType - The MIME type of the file.
 * @returns {Promise<string>} The presigned upload URL.
 */
export const generatePresignedPutUrl = async (key, contentType) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  // URL valid for 15 minutes (900 seconds)
  return await getSignedUrl(s3Client, command, { expiresIn: 900 });
};

/**
 * Generates a temporary presigned GET URL for secure retrieval of private S3 objects.
 * @param {string} key - The S3 object key.
 * @param {number} [expiresInSeconds=900] - URL validity period.
 * @returns {Promise<string>} The presigned retrieval URL.
 */
export const generatePresignedGetUrl = async (key, expiresInSeconds = 900) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
};
