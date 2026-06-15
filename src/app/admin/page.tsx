"use client";

import { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { GalleryManager } from "@/components/admin/GalleryManager";

type Status = "loading" | "ready" | "missing";

export default function AdminPage() {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    // Backend config is generated at deploy and served from /public. Fetch it at
    // runtime so the site still builds locally before the backend is deployed.
    fetch("/amplify_outputs.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("no config"))))
      .then((cfg) => {
        Amplify.configure(cfg, { ssr: true });
        setStatus("ready");
      })
      .catch(() => setStatus("missing"));
  }, []);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-10">
      <h1 className="font-heading text-3xl font-medium tracking-tight">
        Gallery Admin
      </h1>

      {status === "loading" && <p className="mt-6 text-muted">Loading…</p>}

      {status === "missing" && (
        <p className="mt-6 max-w-xl leading-relaxed text-muted">
          后台还未部署。把仓库连到 Amplify 部署一次(会生成 <code>amplify_outputs.json</code>)后,
          这里就能登录、上传照片、改标题、拖拽排序了。
        </p>
      )}

      {status === "ready" && (
        <div className="mt-8">
          <Authenticator hideSignUp>
            {({ signOut }) => <GalleryManager onSignOut={signOut} />}
          </Authenticator>
        </div>
      )}
    </div>
  );
}
