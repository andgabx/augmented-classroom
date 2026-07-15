import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getLyceumClient } from "@/features/lyceum/server/get-lyceum-client";
import { LyceumSessionExpiredError } from "@/features/lyceum/server/lyceum-client";
import { LyceumSessionExpiredNotice } from "@/features/lyceum/components/academic-data";
import { DynamicTable } from "@/features/lyceum/components/dynamic-table";

const BOLETOS_EXCLUDED_FIELDS = ["links"];

export default async function LyceumBoletosPage() {
  const t = await getTranslations("lyceumAcademico");
  const client = await getLyceumClient();
  if (!client) redirect("/settings");

  let boletos: unknown;
  try {
    boletos = await client.getBoletos();
  } catch (error) {
    if (error instanceof LyceumSessionExpiredError) {
      return <LyceumSessionExpiredNotice message={t("sessionExpired")} reconnectLabel={t("reconnect")} />;
    }
    throw error;
  }

  const content = (boletos as { content?: unknown[] } | null)?.content ?? [];

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{t("boletosTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("boletosNote")}</p>
      <DynamicTable data={content} emptyLabel={t("boletosEmptyNote")} excludeKeys={BOLETOS_EXCLUDED_FIELDS} />
    </>
  );
}
