import { readFile } from "node:fs/promises";

const [js, css, config] = await Promise.all([
  readFile(new URL("../src/dotyk-slov.js", import.meta.url), "utf8"),
  readFile(new URL("../src/dotyk-slov.css", import.meta.url), "utf8"),
  readFile(new URL("../src/dotyk-slov.config.js", import.meta.url), "utf8"),
]);

const checks = [
  ["no remote backoffice runtime", !/REMOTE_CONFIG|template-admin|api\/config/.test(js)],
  ["no homepage replacement", !/homepageMarkup|ds9-home-active|insertAdjacentHTML\(\"afterbegin\"/.test(js)],
  ["no native product move", !/appendChild\((bannerRow|benefits|wrapper|heading)\)|append\((bannerRow|benefits|wrapper|heading)\)/.test(js)],
  ["Classic product detail restored", /\.p-detail \{ display: block !important;/.test(css)],
  ["native product inner layout used", /\.p-detail-inner > \.p-image-wrapper/.test(css) && /\.p-detail-inner > \.p-data-wrapper/.test(css)],
  ["feature switches available", /features: \{/.test(config) && /productTabs: true/.test(config)],
  ["release aligned", /release: \"10\.0\.0\"/.test(config)],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
if (failed.length) process.exitCode = 1;
