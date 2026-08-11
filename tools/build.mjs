import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const releaseCssPath = resolve(root, "css/dotyk-slov.css");
const sourceCssPath = resolve(root, "src/dotyk-slov.css");
const sourceJsPath = resolve(root, "src/dotyk-slov.js");
const sourceConfigPath = resolve(root, "src/dotyk-slov.config.js");

const currentRelease = await readFile(releaseCssPath, "utf8");
const marker = "/* Dotyk Slov v9";
const markerIndex = currentRelease.indexOf(marker);

if (markerIndex < 0) {
  throw new Error("The DS9 boundary marker is missing from css/dotyk-slov.css.");
}

const shoptetClassic = currentRelease.slice(0, markerIndex).trimEnd();
const customCss = (await readFile(sourceCssPath, "utf8")).trim();
const sourceJs = (await readFile(sourceJsPath, "utf8")).trim();
const sourceConfig = (await readFile(sourceConfigPath, "utf8")).trim();

if (!shoptetClassic.includes("normalize.css") || shoptetClassic.length < 200_000) {
  throw new Error("The extracted Shoptet Classic bundle does not look complete.");
}

if (/ds-clean-theme|ds8-theme/.test(customCss)) {
  throw new Error("A legacy theme selector leaked into the DS9 CSS source.");
}

await Promise.all([
  writeFile(releaseCssPath, `${shoptetClassic}\n\n${customCss}\n`, "utf8"),
  writeFile(resolve(root, "js/dotyk-slov.js"), `${sourceJs}\n`, "utf8"),
  writeFile(resolve(root, "js/dotyk-slov.config.js"), `${sourceConfig}\n`, "utf8"),
]);

console.log(JSON.stringify({
  classicBytes: Buffer.byteLength(shoptetClassic),
  customCssBytes: Buffer.byteLength(customCss),
  releaseCssBytes: Buffer.byteLength(`${shoptetClassic}\n\n${customCss}\n`),
  releaseJsBytes: Buffer.byteLength(`${sourceJs}\n`),
  releaseConfigBytes: Buffer.byteLength(`${sourceConfig}\n`),
}, null, 2));
