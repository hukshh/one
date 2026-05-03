import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';
import fs from 'fs';

let bucket: GridFSBucket | null = null;
let client: MongoClient | null = null;

async function getBucket(): Promise<GridFSBucket> {
  if (bucket) return bucket;

  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error('DATABASE_URL is not set');

  client = new MongoClient(uri);
  await client.connect();

  const dbName = new URL(uri.replace('mongodb+srv://', 'https://')).pathname.replace('/', '').split('?')[0];
  const db = client.db(dbName || 'meetingmind');
  bucket = new GridFSBucket(db, { bucketName: 'uploads' });

  return bucket;
}

export class StorageService {
  /**
   * Upload a local file to MongoDB GridFS.
   * Returns the GridFS file ID (used as storageKey).
   */
  static async uploadFile(localPath: string, filename: string): Promise<string> {
    const bucket = await getBucket();
    const readStream = fs.createReadStream(localPath);
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { uploadedAt: new Date() },
    });

    await new Promise<void>((resolve, reject) => {
      readStream.pipe(uploadStream);
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
      readStream.on('error', reject);
    });

    return uploadStream.id.toString(); // Return GridFS file _id as string
  }

  /**
   * Download a file from GridFS as a Buffer.
   */
  static async downloadFile(storageKey: string): Promise<Buffer> {
    const bucket = await getBucket();
    const fileId = new ObjectId(storageKey);
    const downloadStream = bucket.openDownloadStream(fileId);

    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      downloadStream.on('data', (chunk) => chunks.push(chunk));
      downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
      downloadStream.on('error', reject);
    });
  }

  /**
   * Get a readable stream for a GridFS file (for streaming to Groq Whisper).
   */
  static async getDownloadStream(storageKey: string): Promise<Readable> {
    const bucket = await getBucket();
    const fileId = new ObjectId(storageKey);
    return bucket.openDownloadStream(fileId);
  }

  /**
   * Get filename stored in GridFS for a given storage key.
   */
  static async getFilename(storageKey: string): Promise<string> {
    const bucket = await getBucket();
    const fileId = new ObjectId(storageKey);
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files.length) throw new Error(`File not found in GridFS: ${storageKey}`);
    return files[0].filename;
  }

  /**
   * Delete a file from GridFS.
   */
  static async deleteFile(storageKey: string): Promise<void> {
    const bucket = await getBucket();
    await bucket.delete(new ObjectId(storageKey));
  }

  /**
   * Always configured since it uses the same MongoDB connection.
   */
  static isConfigured(): boolean {
    return !!process.env.DATABASE_URL;
  }
}
