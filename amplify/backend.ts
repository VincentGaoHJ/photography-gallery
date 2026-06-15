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
 *  - CloudFront (OAC) in front of the bucket so the public site has stable,
 *    cached image/video URLs while the bucket stays private.
 */
const backend = defineBackend({
  auth,
  storage,
});

const cdnStack = backend.createStack("media-cdn");
const distribution = new Distribution(cdnStack, "MediaCdn", {
  comment: "gaohaojun media delivery",
  defaultBehavior: {
    origin: S3BucketOrigin.withOriginAccessControl(
      backend.storage.resources.bucket
    ),
    viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
    cachePolicy: CachePolicy.CACHING_OPTIMIZED,
  },
});

// Exposed in amplify_outputs.json as custom.mediaCdnUrl
backend.addOutput({
  custom: {
    mediaCdnUrl: `https://${distribution.distributionDomainName}`,
  },
});

export default backend;
