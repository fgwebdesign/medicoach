/**
 * Genera docs/resumen-tecnico-medicoach.pdf desde el .md (sin pandoc).
 * Uso: npx tsx scripts/gen-pdf-resumen.ts
 */
import { createWriteStream } from "node:fs";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";

const ROOT = process.cwd();
const MD = path.join(ROOT, "docs/resumen-tecnico-medicoach.md");
const OUT = path.join(ROOT, "docs/resumen-tecnico-medicoach.pdf");
const FONT =
  process.platform === "darwin"
    ? "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
    : "";

function mdToPlain(md: string): string {
  return md
    .replace(/^---[\s\S]*?---\s*/m, "")
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\|/g, " ")
    .replace(/^-\s+/gm, "• ")
    .trim();
}

async function main() {
  const raw = readFileSync(MD, "utf-8");
  const body = mdToPlain(raw);

  const doc = new PDFDocument({
    margin: 48,
    size: "A4",
    info: { Title: "MediCoach — Resumen técnico", Author: "MediCoach" },
  });
  const stream = createWriteStream(OUT);
  doc.pipe(stream);

  if (FONT && existsSync(FONT)) {
    doc.font(FONT);
  } else {
    doc.font("Helvetica");
  }
  doc.fontSize(11).fillColor("#111").text(body, {
    width: doc.page.width - 96,
    align: "left",
  });

  doc.end();
  await new Promise<void>((resolve, reject) => {
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
  console.log("PDF:", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
