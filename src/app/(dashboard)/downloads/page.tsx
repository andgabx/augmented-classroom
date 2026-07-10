import { getTranslations } from "next-intl/server";
import { listAllDownloads } from "@/features/downloads/server/downloads";
import { DownloadsList } from "@/features/downloads/components/downloads-list";

export default async function DownloadsPage() {
  const t = await getTranslations("downloads");
  const tMaterials = await getTranslations("materials");
  const downloads = listAllDownloads(tMaterials("untitled"));

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
      <DownloadsList initialDownloads={downloads} />
    </>
  );
}
