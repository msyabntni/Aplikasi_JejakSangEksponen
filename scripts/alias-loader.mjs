/**
 * Loader Node agar skrip (generate-seed, uji perjalanan) bisa mengimpor kode aplikasi
 * yang memakai alias "@/..." dan impor tanpa ekstensi, sama seperti di Next.js.
 * Pakai: node --import ./scripts/alias-loader.mjs scripts/<skrip>.mjs
 */
import { registerHooks } from "node:module";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = new URL("../src/", import.meta.url).href;
const EXTS = ["", ".js", ".mjs", "/index.js"];

function tryFile(url) {
  for (const e of EXTS) {
    const p = fileURLToPath(url + e);
    if (existsSync(p) && statSync(p).isFile()) return pathToFileURL(p).href;
  }
  return null;
}

registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith("@/")) {
      const hit = tryFile(SRC + spec.slice(2));
      if (hit) return { url: hit, shortCircuit: true };
    }
    if ((spec.startsWith("./") || spec.startsWith("../")) && ctx.parentURL?.startsWith("file:")) {
      const hit = tryFile(new URL(spec, ctx.parentURL).href);
      if (hit) return { url: hit, shortCircuit: true };
    }
    return next(spec, ctx);
  },
});
