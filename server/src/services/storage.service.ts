import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

export class StorageService {
  private static s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  private static bucketName = process.env.AWS_BUCKET_NAME || '';

  /**
   * Uploads a local file to S3
   */
  static async uploadFile(localPath: string, fileName: string): Promise<string> {
    const fileStream = fs.createReadStream(localPath);
    const key = `meetings/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileStream,
      ContentType: this.getContentType(fileName),
    });

    await this.s3Client.send(command);
    return key;
  }

  /**
   * Generates a presigned URL for a file in S3
   * Valid for 1 hour by default
   */
  static async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Helper to determine content type based on extension
   */
  private static getContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
      case '.mp3': return 'audio/mpeg';
      case '.wav': return 'audio/wav';
      case '.mp4': return 'video/mp4';
      case '.mov': return 'video/quicktime';
      default: return 'application/octet-stream';
    }
  }

  /**
   * Check if S3 is configured
   */
  static isConfigured(): boolean {
    return !!(
      process.env.AWS_ACCESS_KEY_ID && 
      process.env.AWS_SECRET_ACCESS_KEY && 
      process.env.AWS_BUCKET_NAME
    );
  }
}
