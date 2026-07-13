import path from "node:path";
import { pathToFileURL } from "node:url";

const srcDir = pathToFileURL(`${path.join(process.cwd(), "src")}/`).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const rest = specifier.slice(2);
    const withExt = /\.[a-z]+$/.test(rest) ? rest : `${rest}.ts`;
    return nextResolve(srcDir + withExt, context);
  }
  return nextResolve(specifier, context);
}
