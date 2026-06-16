import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { cookies } from "next/headers";
import { fetchAuthSession } from "aws-amplify/auth/server";
import type { AmplifyServer } from "aws-amplify/adapter-core/internals";
import outputs from "../../amplify_outputs.json";

/**
 * Server-side Amplify context. The /admin browser (in China) can't reach the
 * Singapore S3 directly, so all S3 work runs here — inside AWS — via Next API
 * routes. The browser only talks to the app's own domain (CloudFront).
 */
export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

export type Ctx = AmplifyServer.ContextSpec;

/**
 * Run a storage operation as the signed-in admin, reusing the existing Cognito
 * session (tokens are in cookies because the client configures Amplify with
 * `ssr: true`). Returns the op's Response, or 401 if there's no valid session.
 */
export async function asAdmin(
  op: (contextSpec: Ctx) => Promise<Response>
): Promise<Response> {
  return runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        if (!session.tokens) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
      } catch {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      return op(contextSpec);
    },
  });
}
