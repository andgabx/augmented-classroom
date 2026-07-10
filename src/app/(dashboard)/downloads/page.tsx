import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/server/session";
import { listAllDownloads } from "@/features/downloads/server/downloads";
import { DownloadsList } from "@/features/downloads/components/downloads-list";

export default async function DownloadsPage() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/");
  }

  const downloads = listAllDownloads();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Downloads</h1>
      <DownloadsList initialDownloads={downloads} />
    </div>
  );
}
