import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/integrations/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { createAdminClient } from "@/lib/integrations/supabase/admin";
import { createMediCoachTools } from "./chat-tools";

function makeSymptomsChain() {
  return {
    select: () => ({
      eq: () => ({
        gte: () => ({
          order: () =>
            Promise.resolve({ data: [{ id: "s-1" }], error: null }),
        }),
      }),
    }),
  };
}

function makeMedicationsChain() {
  return {
    select: () => ({
      eq: () => ({
        eq: () =>
          Promise.resolve({ data: [{ id: "m-1" }], error: null }),
      }),
    }),
  };
}

describe("createMediCoachTools — datos de paciente (Supabase, sin MCP)", () => {
  const patientId = "p-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registrar_sintoma: inserta en la tabla symptoms", async () => {
    const single = vi
      .fn()
      .mockResolvedValue({ data: { id: "row-1" }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi
      .fn()
      .mockImplementation((t: string) => {
        if (t === "symptoms") return { insert };
        return {};
      });

    vi.mocked(createAdminClient).mockReturnValue(
      { from } as never,
    );

    const tools = createMediCoachTools({ patientId, locale: "es" });
    const out = await tools.registrar_sintoma.execute?.(
      { sintoma: "mareos", severidad: 3 },
      {} as never,
    );

    expect(out).toMatchObject({ ok: true, id: "row-1" });
    expect(insert).toHaveBeenCalled();
  });

  it("obtener_historial: lee symptoms y medications", async () => {
    const from = vi.fn().mockImplementation((t: string) => {
      if (t === "symptoms") return makeSymptomsChain();
      if (t === "medications")
      if (t === "medications") return makeMedicationsChain();
      return {};
    });

    vi.mocked(createAdminClient).mockReturnValue({ from } as never);

    const tools = createMediCoachTools({ patientId, locale: "es" });
    const out = await tools.obtener_historial.execute?.({ dias: 7 }, {} as never);

    expect(out).toEqual({
      sintomas: [{ id: "s-1" }],
      medicaciones: [{ id: "m-1" }],
      dias: 7,
    });
  });
});
