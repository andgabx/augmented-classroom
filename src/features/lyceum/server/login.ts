import { spawn } from "node:child_process";
import path from "node:path";

const LOGIN_SCRIPT = path.join(process.cwd(), "scripts", "lyceum-login.mts");

export interface LyceumLoginResult {
  tenant: string;
  sessionId: string;
  userData: string;
  ra: string;
  internalId: string;
}

export function runLyceumLogin(tenant: string): Promise<LyceumLoginResult> {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, ["--experimental-strip-types", LOGIN_SCRIPT], {
      env: { ...process.env, LYCEUM_TENANT: tenant },
      stdio: ["ignore", "pipe", "inherit"],
    });

    let output = "";
    proc.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Login do Lyceum encerrou com código ${code}`));
        return;
      }
      try {
        const lastLine = output.trim().split("\n").pop() ?? "";
        resolve(JSON.parse(lastLine) as LyceumLoginResult);
      } catch (error) {
        reject(new Error("Não foi possível ler o resultado do login do Lyceum", { cause: error }));
      }
    });

    proc.on("error", reject);
  });
}
