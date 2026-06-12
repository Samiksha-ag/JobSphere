const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// S3 is optional: if credentials are not configured, the app falls back to
// local disk storage so it still runs without an AWS account.
const isConfigured = () =>
  Boolean(REGION && BUCKET && ACCESS_KEY && SECRET_KEY);

let client = null;
const getClient = () => {
  if (!client) {
    client = new S3Client({
      region: REGION,
      credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
    });
  }
  return client;
};

const uploadToS3 = async (key, buffer, contentType) => {
  await getClient().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return key;
};

// Time-limited URL the browser can open directly (default 5 minutes).
const getPresignedUrl = (key, expiresIn = 300) =>
  getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn }
  );

// Readable stream of an object's bytes, for piping through the API.
const getObjectStream = async (key) => {
  const out = await getClient().send(
    new GetObjectCommand({ Bucket: BUCKET, Key: key })
  );
  return out.Body;
};

const deleteFromS3 = async (key) => {
  await getClient().send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: key })
  );
};

module.exports = {
  isConfigured,
  uploadToS3,
  getPresignedUrl,
  getObjectStream,
  deleteFromS3,
};
