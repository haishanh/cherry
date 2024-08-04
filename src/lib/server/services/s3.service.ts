import { PutObjectCommand, type PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';

export class S3Service {
  public readonly s3: S3Client;
  public readonly bucket: string;

  constructor(opts: {
    s3Endpoint: string;
    s3Region: string;
    s3Bucket: string;
    s3AccessKeyId: string;
    s3SecretAccessKey: string;
  }) {
    this.s3 = new S3Client({
      endpoint: opts.s3Endpoint,
      region: opts.s3Region,
      credentials: {
        accessKeyId: opts.s3AccessKeyId,
        secretAccessKey: opts.s3SecretAccessKey,
      },
    });
    this.bucket = opts.s3Bucket;
  }

  async putObject(input: Omit<PutObjectCommandInput, 'Bucket'>) {
    // https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-example-creating-buckets.html#s3-example-creating-buckets-upload-file
    const Bucket = this.bucket;
    return await this.s3.send(new PutObjectCommand({ Bucket, ...input }));
  }
}
