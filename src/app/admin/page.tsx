"use client";

import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import outputs from "../../../amplify_outputs.json";
import { GalleryManager } from "@/components/admin/GalleryManager";

// Standard Amplify Gen 2 config: amplify_outputs.json is generated at the repo
// root by the backend build phase (and kept locally, gitignored).
Amplify.configure(outputs, { ssr: true });

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-10">
      <h1 className="font-heading text-3xl font-medium tracking-tight">
        Gallery Admin
      </h1>
      <div className="mt-8">
        <Authenticator hideSignUp>
          {({ signOut }) => <GalleryManager onSignOut={signOut} />}
        </Authenticator>
      </div>
    </div>
  );
}
