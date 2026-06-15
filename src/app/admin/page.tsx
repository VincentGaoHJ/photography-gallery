"use client";

import { useState } from "react";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import outputs from "../../../amplify_outputs.json";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { BlogManager } from "@/components/admin/BlogManager";

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
          {({ signOut }) => <AdminTabs onSignOut={signOut} />}
        </Authenticator>
      </div>
    </div>
  );
}

function AdminTabs({ onSignOut }: { onSignOut?: () => void }) {
  const [tab, setTab] = useState<"galleries" | "blog">("galleries");
  return (
    <div>
      <div className="mb-8 flex items-center gap-1 border-b border-border">
        <TabButton active={tab === "galleries"} onClick={() => setTab("galleries")}>
          相册
        </TabButton>
        <TabButton active={tab === "blog"} onClick={() => setTab("blog")}>
          博客
        </TabButton>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="ml-auto text-sm text-muted transition-colors hover:text-accent"
          >
            退出登录
          </button>
        )}
      </div>
      {tab === "galleries" ? <GalleryManager /> : <BlogManager />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm transition-colors ${
        active
          ? "border-accent text-accent"
          : "border-transparent text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
