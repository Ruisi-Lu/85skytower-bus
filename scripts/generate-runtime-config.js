import { existsSync, readFileSync, writeFileSync } from "node:fs";

const mode = process.argv.includes("--native") ? "native" : "web";
const env = {
  ...readDotEnv(".env"),
  ...process.env
};

const workerOrigin = normalizeOrigin(env.WORKER_ORIGIN || "");
if (mode === "native" && !workerOrigin) {
  console.error("WORKER_ORIGIN is required for native builds. Put it in .env.");
  process.exit(1);
}

const config = mode === "native" ? { workerOrigin } : {};
const output = `window.__SANDUO85_CONFIG__ = ${JSON.stringify(config, null, 2)};\n`;

writeFileSync("public/runtime-config.js", output);

function readDotEnv(filePath) {
  if (!existsSync(filePath)) return {};

  return readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((result, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return result;
      const separator = trimmed.indexOf("=");
      if (separator === -1) return result;

      const key = trimmed.slice(0, separator).trim();
      const rawValue = trimmed.slice(separator + 1).trim();
      result[key] = stripQuotes(rawValue);
      return result;
    }, {});
}

function stripQuotes(value) {
  if (
    (value.startsWith("\"") && value.endsWith("\""))
    || (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function normalizeOrigin(value) {
  return String(value).trim().replace(/\/+$/, "");
}
