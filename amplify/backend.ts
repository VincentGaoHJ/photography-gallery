import { defineBackend } from "@aws-amplify/backend";
import {
  Distribution,
  ViewerProtocolPolicy,
  AllowedMethods,
  CachePolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { auth } from "./auth/resource";
import { storage } from "./storage/resource";

/**
 * Backend:
 *  - auth: Cognito (email login) — gates the /admin editor.
 *  - storage: S3 bucket for media (media/*).
 *  - CloudFront (OAC) in front of the bucket for stable, cached public media URLs.
 */
const backend = defineBackend({
  auth,
  storage,
});

// IMPORTANT: create the distribution inside the STORAGE stack (not a separate
// stack). OAC adds a bucket policy referencing the distribution; in separate
// nested stacks that creates a CloudFormation circular dependency.
const bucket = backend.storage.resources.bucket;
const s3Origin = S3BucketOrigin.withOriginAccessControl(bucket);

const distribution = new Distribution(bucket.stack, "MediaCdn", {
  comment: "gaohaojun media delivery",
  defaultBehavior: {
    // images/videos are immutable -> cache hard
    origin: s3Origin,
    viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
    cachePolicy: CachePolicy.CACHING_OPTIMIZED,
  },
  additionalBehaviors: {
    // the editable manifest must stay fresh so /admin edits show quickly
    "media/galleries.json": {
      origin: s3Origin,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
      cachePolicy: CachePolicy.CACHING_DISABLED,
    },
  },
});

// Exposed in amplify_outputs.json as custom.mediaCdnUrl
backend.addOutput({
  custom: {
    mediaCdnUrl: `https://${distribution.distributionDomainName}`,
  },
});

export default backend;
