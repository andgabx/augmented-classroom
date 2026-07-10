import { chromium } from "playwright";

const tenant = process.env.LYCEUM_TENANT;
if (!tenant) {
  console.error("LYCEUM_TENANT ausente.");
  process.exit(1);
}

const LYCEUM_URL = `https://${tenant}.lyceum.com.br`;
const LOGIN_URL = `${LYCEUM_URL}/AOnline3/#/login/`;
const HISTORICO_URL = `${LYCEUM_URL}/AOnline3/#/home/historico`;

async function login() {
  console.error("Abrindo portal Lyceum...");

  const browser = await chromium.launch({ headless: false, channel: "chrome" });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(LOGIN_URL);

  console.error("Complete o login no navegador. Aguardando redirecionamento...");

  await page.waitForURL((url) => !url.toString().includes("login"), { timeout: 120_000 });
  await page.waitForLoadState("networkidle").catch(() => {});

  console.error("Capturando RA via histórico...");
  const raResponsePromise = page
    .waitForResponse(
      (resp) => resp.url().includes("listarCabecalhoHistorico") && resp.status() === 200,
      { timeout: 25_000 }
    )
    .catch(() => null);

  await page.goto(HISTORICO_URL, { waitUntil: "domcontentloaded" });

  let ra: string | null = null;

  const raResponse = await raResponsePromise;
  if (raResponse) {
    try {
      const json = (await raResponse.json()) as Record<string, unknown>;
      if (json.ALUNO) ra = String(json.ALUNO);
    } catch {
      // ignora
    }
  }

  if (!ra) {
    ra = await page
      .evaluate(() => {
        const text = document.body.innerText ?? "";
        const m = text.match(/\b(\d{8,12})\b/);
        return m ? m[1] : null;
      })
      .catch(() => null);
    if (ra) console.error(`RA capturado via DOM: ${ra}`);
  }

  const cookies = await context.cookies();
  const jsessionId = cookies.find((c) => c.name === "JSESSIONID" && c.domain.includes("lyceum"))?.value;
  const userDataValue = cookies.find((c) => c.name === "user-data" && c.domain.includes("lyceum"))?.value ?? "";

  let internalId = "";
  try {
    const payload = JSON.parse(Buffer.from(userDataValue, "base64url").toString("utf8")) as { id?: unknown };
    if (payload.id) internalId = String(payload.id);
  } catch {
    // ignora
  }

  await browser.close();

  if (!jsessionId) throw new Error("JSESSIONID não encontrado. Verifique se o login foi concluído.");
  if (!ra) throw new Error("RA não capturado automaticamente.");
  if (!internalId) throw new Error("ID interno não encontrado no cookie user-data.");

  console.log(JSON.stringify({ tenant, sessionId: jsessionId, userData: userDataValue, ra, internalId }));
}

login().catch((error: Error) => {
  console.error(`Erro no login: ${error.message}`);
  process.exit(1);
});
