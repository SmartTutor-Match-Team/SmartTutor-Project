import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_SESSION_TOKEN } from '$env/static/private';
import { randomUUID } from "crypto";

const credentials: any = {
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  sessionToken: AWS_SESSION_TOKEN
};

// Read session token from environment at runtime if present (useful for temporary credentials)
const sessionToken = process.env.AWS_SESSION_TOKEN;
if (sessionToken) {
  credentials.sessionToken = sessionToken;
}

const s3 = new S3Client({
  region: AWS_REGION,
  credentials
});

export async function uploadProfileImage(file: File) {
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const key = `profiles/${randomUUID()}-${file.name}`;
  try {
    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: file.type
    }));

    return `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
  } catch (err) {
    // Re-throw after logging so callers can handle it (we already catch in server actions)
    console.error('Failed to upload profile image to S3:', err);
    throw err;
  }
}
