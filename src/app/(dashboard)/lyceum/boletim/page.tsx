import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getLyceumClient } from "@/features/lyceum/server/get-lyceum-client";
import { LyceumSessionExpiredError } from "@/features/lyceum/server/lyceum-client";
import { COMMON_EXCLUDED_FIELDS, DynamicTable, LyceumSessionExpiredNotice } from "@/features/lyceum/components/academic-data";

const FALTAS_PATTERN = /falta|frequenc/i;

export default async function LyceumBoletimPage() {
  const t = await getTranslations("lyceumAcademico");
  const client = await getLyceumClient();
  if (!client) redirect("/settings");

  let data: { boletim: unknown; disciplinas: unknown };
  try {
    const [boletim, disciplinas] = await Promise.all([client.getBoletim(), client.getDisciplinasBoletim()]);
    data = { boletim, disciplinas };
  } catch (error) {
    if (error instanceof LyceumSessionExpiredError) {
      return <LyceumSessionExpiredNotice message={t("sessionExpired")} reconnectLabel={t("reconnect")} />;
    }
    throw error;
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("boletimTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("boletimCurrentOnlyNote")}</p>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-foreground">{t("disciplinasTitle")}</h2>
        <DynamicTable data={data.disciplinas} emptyLabel={t("emptyData")} excludeKeys={COMMON_EXCLUDED_FIELDS} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-foreground">{t("notasTitle")}</h2>
        <DynamicTable
          data={data.boletim}
          emptyLabel={t("emptyData")}
          excludeKeys={COMMON_EXCLUDED_FIELDS}
          excludePattern={FALTAS_PATTERN}
        />
      </section>
    </>
  );
}
