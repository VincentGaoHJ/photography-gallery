import { defineBackend } from "@aws-amplify/backend";
import { storage } from "./storage/resource";

/**
 * Backend definition: S3 storage for media files.
 * Auth (Cognito) can be added later for admin access.
 */
const backend = defineBackend({
  storage,
});

// Export for type inference in frontend
export default backend;