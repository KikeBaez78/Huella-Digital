import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildResumenPrompt } from "@/lib/prompt";

export async function POST(req: NextRequest) {
  const { nombre, direccion, analisis, datosReales, apiKey } = await req.json();

  if (!apiKey) {
    return NextResponse.json({ error: "Falta la API Key." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  const prompt = buildResumenPrompt(nombre, direccion, analisis, datosReales);

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const texto =
    message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json({ resumen: texto });
}
