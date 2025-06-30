import AWS from 'aws-sdk';

export class AWSService {
  private s3: AWS.S3;
  private cloudfront: AWS.CloudFront;

  constructor() {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    });

    this.s3 = new AWS.S3();
    this.cloudfront = new AWS.CloudFront();
  }

  // Upload match photo/video
  async uploadMatchMedia(file: Buffer, fileName: string, contentType: string): Promise<string> {
    try {
      const key = `matches/${Date.now()}-${fileName}`;
      
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET || 'sportwarren-media',
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: 'public-read',
      };

      const result = await this.s3.upload(uploadParams).promise();
      
      // Return CloudFront URL if configured
      const cloudfrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;
      if (cloudfrontDomain) {
        return `https://${cloudfrontDomain}/${key}`;
      }
      
      return result.Location;
    } catch (error) {
      console.error('AWS S3 upload error:', error);
      throw new Error('Failed to upload media');
    }
  }

  // Upload user avatar
  async uploadAvatar(file: Buffer, userId: string, contentType: string): Promise<string> {
    try {
      const key = `avatars/${userId}-${Date.now()}.jpg`;
      
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET || 'sportwarren-media',
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: 'public-read',
      };

      const result = await this.s3.upload(uploadParams).promise();
      
      const cloudfrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;
      if (cloudfrontDomain) {
        return `https://${cloudfrontDomain}/${key}`;
      }
      
      return result.Location;
    } catch (error) {
      console.error('AWS S3 avatar upload error:', error);
      throw new Error('Failed to upload avatar');
    }
  }

  // Generate presigned URL for direct upload
  async generatePresignedUrl(fileName: string, contentType: string, folder: string = 'uploads'): Promise<string> {
    try {
      const key = `${folder}/${Date.now()}-${fileName}`;
      
      const params = {
        Bucket: process.env.AWS_S3_BUCKET || 'sportwarren-media',
        Key: key,
        ContentType: contentType,
        Expires: 300, // 5 minutes
        ACL: 'public-read',
      };

      return this.s3.getSignedUrl('putObject', params);
    } catch (error) {
      console.error('AWS presigned URL error:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  // Delete media file
  async deleteMedia(key: string): Promise<void> {
    try {
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET || 'sportwarren-media',
        Key: key,
      };

      await this.s3.deleteObject(deleteParams).promise();
    } catch (error) {
      console.error('AWS S3 delete error:', error);
      throw new Error('Failed to delete media');
    }
  }

  // Create CloudFront invalidation
  async invalidateCloudFront(paths: string[]): Promise<void> {
    try {
      if (!process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID) {
        return; // Skip if CloudFront not configured
      }

      const params = {
        DistributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
        InvalidationBatch: {
          CallerReference: Date.now().toString(),
          Paths: {
            Quantity: paths.length,
            Items: paths,
          },
        },
      };

      await this.cloudfront.createInvalidation(params).promise();
    } catch (error) {
      console.error('AWS CloudFront invalidation error:', error);
      // Don't throw error for invalidation failures
    }
  }

  // Get media metadata
  async getMediaMetadata(key: string): Promise<any> {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET || 'sportwarren-media',
        Key: key,
      };

      const result = await this.s3.headObject(params).promise();
      return {
        size: result.ContentLength,
        contentType: result.ContentType,
        lastModified: result.LastModified,
        etag: result.ETag,
      };
    } catch (error) {
      console.error('AWS S3 metadata error:', error);
      return null;
    }
  }
}