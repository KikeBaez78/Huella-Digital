"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiKey, saveNegocio } from "@/lib/storage";
import { Building2, MapPin, Briefcase, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NuevoAnalisis() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: "", direccion: "", giro: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progreso, setProgreso] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const apiKey = getApiKey();
    if (!apiKey) {
      setError("Primero configura tu API Key de Anthropic en Configuración.");
      return;
    }
    if (!form.nombre.trim() || !form.direccion.trim()) {
      setError("Nombre y dirección son obligatorios.");
      return;
    }

    setLoading(true);
    setError("");
    setProgreso("Investigando el negocio...");

    try {
      const res = await fetch("/api/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, apiKey }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al generar el análisis");
      }

      setProgreso("Generando análisis estratégico...");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let analisis = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        analisis += decoder.decode(value, { stream: true });
        setProgreso(`Analizando... ${analisis.length} caracteres generados`);
      }

      const id = crypto.randomUUID();
      saveNegocio({
        id,
        nombre: form.nombre,
        direccion: form.direccion,
        ciudad: "",
        giro: form.giro,
        fechaCreacion: new Date().toISOString(),
        estado: "nuevo",
        analisis,
      });

      router.push(`/analisis/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
      setProgreso("");
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al panel
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Nuevo análisis</h1>
        <p className="text-gray-500 text-sm mb-8">
          Ingresa el nombre y la dirección del negocio. La IA hará el resto.
        </p>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre del negocio *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ej: Fixmovil TJ"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Dirección completa *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ej: Blvd Cucapah 11122, Valle Verde, Tijuana"
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Giro del negocio{" "}
              <span className="text-gray-400 font-normal">(opcional, mejora el análisis)</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ej: Reparación de celulares y accesorios"
                value={form.giro}
                onChange={(e) => setForm({ ...form, giro: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {progreso || "Generando análisis..."}
              </>
            ) : (
              "Generar análisis completo"
            )}
          </button>
        </form>

        {loading && (
          <div className="mt-6 bg-indigo-50 rounded-lg p-4 text-center">
            <div className="text-sm text-indigo-700 font-medium mb-1">
              Esto tarda entre 30 y 60 segundos
            </div>
            <div className="text-xs text-indigo-500">
              La IA está analizando el negocio, la zona, la competencia y generando el plan de acción completo.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
