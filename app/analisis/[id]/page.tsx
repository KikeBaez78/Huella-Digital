"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getNegocio, saveNegocio, getApiKey } from "@/lib/storage";
import { Negocio, EstadoProspecto } from "@/lib/types";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import EstadoBadge from "@/components/EstadoBadge";
import {
  ArrowLeft,
  Download,
  Building2,
  MapPin,
  StickyNote,
  Save,
  FileText,
  Zap,
  Copy,
  Check,
  Loader2,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

const ESTADOS: EstadoProspecto[] = [
  "nuevo",
  "contactado",
  "propuesta_enviada",
  "vendido",
  "perdido",
];

export default function AnalisisPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [resumen, setResumen] = useState("");
  const [generandoResumen, setGenerandoResumen] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const n = getNegocio(id);
    if (!n) { router.push("/"); return; }
    setNegocio(n);
    setNotas(n.notas || "");
  }, [id, router]);

  function handleEstado(estado: EstadoProspecto) {
    if (!negocio) return;
    const updated = { ...negocio, estado };
    saveNegocio(updated);
    setNegocio(updated);
  }

  function handleGuardarNotas() {
    if (!negocio) return;
    setGuardando(true);
    const updated = { ...negocio, notas };
    saveNegocio(updated);
    setNegocio(updated);
    setTimeout(() => setGuardando(false), 1000);
  }

  async function handleExportPDF() {
    if (!negocio?.analisis) return;
    const { default: html2pdf } = await import("html2pdf.js");
    const element = document.getElementById("analisis-content");
    if (!element) return;
    html2pdf()
      .set({
        margin: 12,
        filename: `analisis-${negocio.nombre.toLowerCase().replace(/\s+/g, "-")}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  }

  async function handleGenerarResumen() {
    if (!negocio?.analisis) return;
    const apiKey = getApiKey();
    if (!apiKey) {
      alert("Configura tu API Key primero.");
      return;
    }

    setGenerandoResumen(true);
    setResumen("");

    try {
      const res = await fetch("/api/resumen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: negocio.nombre,
          direccion: negocio.direccion,
          analisis: negocio.analisis,
          datosReales: negocio.datosReales || "",
          apiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResumen(data.resumen);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error generando resumen");
    } finally {
      setGenerandoResumen(false);
    }
  }

  async function handleCopiar() {
    await navigator.clipboard.writeText(resumen);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (!negocio) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Panel
        </Link>
        <div className="flex items-center gap-2">
          {negocio.analisis && (
            <>
              <button
                onClick={handleGenerarResumen}
                disabled={generandoResumen}
                className="flex items-center gap-1.5 text-sm font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {generandoResumen ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {generandoResumen ? "Generando..." : "Resumen gancho"}
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Resumen gancho */}
      {resumen && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-gray-900">Resumen gancho — listo para WhatsApp</h2>
            </div>
            <button
              onClick={handleCopiar}
              className="flex items-center gap-1.5 text-sm font-medium border border-indigo-200 bg-white text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              {copiado ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </button>
          </div>
          <div className="bg-white rounded-xl p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed border border-indigo-100">
            {resumen}
          </div>
          <p className="text-xs text-indigo-500 mt-3">
            Copia este mensaje y envíalo al dueño del negocio por WhatsApp para abrir la conversación.
          </p>
        </div>
      )}

      {/* Info del negocio */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{negocio.nombre}</h1>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {negocio.direccion}
            </div>
            {negocio.giro && (
              <div className="text-sm text-gray-400 mt-0.5">{negocio.giro}</div>
            )}
            <div className="mt-2">
              <EstadoBadge estado={negocio.estado} />
            </div>
          </div>
        </div>

        {/* Cambiar estado */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">Estado del prospecto</p>
          <div className="flex gap-2 flex-wrap">
            {ESTADOS.map((e) => (
              <button
                key={e}
                onClick={() => handleEstado(e)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  negocio.estado === e
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {e === "nuevo" ? "Nuevo" :
                 e === "contactado" ? "Contactado" :
                 e === "propuesta_enviada" ? "Propuesta enviada" :
                 e === "vendido" ? "Vendido" : "Perdido"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Análisis */}
      {negocio.analisis ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6" id="analisis-content">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Análisis estratégico completo</h2>
          </div>
          <MarkdownRenderer content={negocio.analisis} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center mb-6">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Este prospecto aún no tiene análisis generado.</p>
        </div>
      )}

      {/* Notas */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <StickyNote className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-800">Notas del prospecto</h3>
        </div>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Agrega notas privadas: fecha de contacto, precio ofrecido, objeciones, próximos pasos..."
          className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows={5}
        />
        <button
          onClick={handleGuardarNotas}
          className="mt-3 flex items-center gap-1.5 text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          {guardando ? "Guardado" : "Guardar notas"}
        </button>
      </div>
    </div>
  );
}
