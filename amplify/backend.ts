import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { storage } from "./storage/resource";

/**
 * Backend definition:
 *  - auth: Cognito (email login) — gates the /admin editor.
 *  - storage: S3 bucket for media (media/*). Public read for the website is
 *    configured separately (CloudFront / bucket policy).
 */
const backend = defineBackend({
  auth,
  storage,
});

export default backend;
