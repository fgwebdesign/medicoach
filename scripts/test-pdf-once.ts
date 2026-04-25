import { buildReportPdfBuffer } from "../lib/medicoach/report/build-report-pdf";

async function main() {
  const buf = await buildReportPdfBuffer({
    generatedAt: "t",
    emailHint: "a@a.com",
    profile: null,
    medications: [],
    symptoms: [],
    chat: null,
    disclaimer: "d",
  });
  console.log("ok", buf.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
