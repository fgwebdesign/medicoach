import PDFDocument from "pdfkit";

export type ReportProfile = {
  display_name: string | null;
  conditions: string[] | null;
};

export type ReportMedication = {
  name: string;
  dose: string | null;
  frequency: string | null;
};

export type ReportSymptom = {
  symptom: string;
  severity: number;
  note: string | null;
  recorded_at: string;
};

export type ReportChatExcerpt = {
  updatedAt: string;
  text: string;
};

export type ReportBundle = {
  generatedAt: string;
  emailHint: string;
  profile: ReportProfile | null;
  medications: ReportMedication[];
  symptoms: ReportSymptom[];
  chat: ReportChatExcerpt | null;
  disclaimer: string;
};

const MAX_TRANSCRIPT = 9_000;

function clip(s: string, n: number): string {
  const t = s.replace(/\0/g, "");
  if (t.length <= n) return t;
  return `${t.slice(0, n - 1)}…`;
}

/** Normaliza el JSONB `messages` de `chat_sessions` a texto plano. */
export function messagesJsonToExcerpt(
  raw: unknown,
  updatedAtIso: string,
): ReportChatExcerpt | null {
  if (!Array.isArray(raw) || raw.length === 0) {
    return null;
  }
  const lines: string[] = [];
  let len = 0;
  for (const m of raw) {
    if (!m || typeof m !== "object") continue;
    const o = m as { role?: string; content?: string };
    const text = (o.content ?? "").trim();
    if (!text) continue;
    const who =
      o.role === "user"
        ? "Paciente"
        : o.role === "assistant"
          ? "Asistente"
          : o.role ?? "Mensaje";
    const line = `${who}: ${text}`;
    if (len + line.length + 1 > MAX_TRANSCRIPT) {
      const rest = MAX_TRANSCRIPT - len - 1;
      if (rest > 20) {
        lines.push(line.slice(0, rest) + "…");
      }
      break;
    }
    lines.push(line);
    len += line.length + 1;
  }
  const text = lines.join("\n");
  if (!text) return null;
  return { updatedAt: updatedAtIso, text };
}

/**
 * Arma un PDF A4 sencillo para llevar a la consulta.
 * Tipografía estándar PDF (Helvetica) — adecuada para es-AR con acentos comunes.
 */
export function buildReportPdfBuffer(data: ReportBundle): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: "MediCoach reporte" } });
    const chunks: Buffer[] = [];
    doc.on("data", (b: Buffer) => chunks.push(b));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const title = "MediCoach — Reporte para el médico";
    doc
      .fontSize(16)
      .fillColor("#0f766e")
      .text(title, { align: "center" });
    doc.moveDown(0.4);
    doc
      .fontSize(9)
      .fillColor("#444")
      .text(
        `Generado: ${data.generatedAt} · Cuenta: ${data.emailHint}`,
        { align: "center" },
      );
    doc.moveDown(1.2);
    doc.fillColor("#111").fontSize(10);

    const p = data.profile;
    if (p?.display_name || (p?.conditions && p.conditions.length)) {
      doc.fontSize(12).text("Perfil", { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10);
      if (p?.display_name) {
        doc.text(`Nombre: ${p.display_name}`);
        doc.moveDown(0.2);
      }
      if (p?.conditions?.length) {
        doc.text(`Condiciones referidas: ${p.conditions.join(", ")}`);
        doc.moveDown(0.2);
      }
      doc.moveDown(0.6);
    }

    doc.fontSize(12).text("Medicación activa", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10);
    if (data.medications.length === 0) {
      doc.fillColor("#555").text("— Sin medicación activa registrada en MediCoach —");
    } else {
      data.medications.forEach((m) => {
        const bits = [m.name, m.dose, m.frequency].filter(Boolean).join(" · ");
        doc.fillColor("#111").text(`• ${bits}`);
        doc.moveDown(0.2);
      });
    }
    doc.moveDown(0.5);

    doc.fontSize(12).text("Síntomas recientes (ventana de datos)", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#666").text("Severidad 1–10 según registro en la app o chat.");
    doc.moveDown(0.3);
    doc.fontSize(10);
    if (data.symptoms.length === 0) {
      doc.fillColor("#555").text("— Sin síntomas registrados en el período —");
    } else {
      for (const s of data.symptoms) {
        const d = new Date(s.recorded_at);
        const fecha = d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
        const note = s.note ? ` · ${s.note}` : "";
        doc
          .fillColor("#111")
          .text(`• ${s.symptom} (${s.severity}/10) — ${fecha}${note}`);
        doc.moveDown(0.2);
      }
    }
    doc.moveDown(0.5);

    doc.fontSize(12).text("Conversación con el asistente (resumen en texto)", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#666");
    if (data.chat) {
      doc.text(`Última actualización de la charla: ${data.chat.updatedAt}`);
      doc.moveDown(0.3);
    }
    doc.fontSize(10);
    if (!data.chat?.text) {
      doc.text("— Aún no hay charla guardada en tu cuenta, o el historial está vacío. —", {
        width: 480,
        align: "left",
      });
    } else {
      doc.text(clip(data.chat.text, MAX_TRANSCRIPT), { width: 480, align: "left" });
    }

    doc.moveDown(1.2);
    doc.fontSize(8).fillColor("#666");
    doc.text(clip(data.disclaimer, 2000), { width: 480, align: "left" });

    doc.end();
  });
}
