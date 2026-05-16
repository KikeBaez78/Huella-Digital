"use client";
import { useEffect, useState } from "react";
import { getApiKey, setApiKey } from "@/lib/storage";
import { KeyRound, Save, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Configuracion() {
  const [key, setKey] = useState("");
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    setKey(getApiKey());
  }, []);

  function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setApiKey(key.trim());
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al panel
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Configuración</h1>
            <p className="text-sm text-gray-500">API Key de Anthropic</p>
          </div>
        </div>

        <form onSubmit={handleGuardar} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Anthropic API Key
            </label>
            <input
              type="password"
              placeholder="sk-ant-api03-..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {guardado ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                API Key guardada
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar API Key
              </>
            )}
          </button>
        </form>

        <div className="mt-6 bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            Tu API Key es privada y segura
          </div>
          <ul className="text-xs text-gray-500 space-y-1.5 ml-6">
            <li>• Se guarda solo en tu navegador (localStorage), nunca en servidores externos.</li>
            <li>• Se usa únicamente para llamar a Claude y generar los análisis.</li>
            <li>
              • Obtén tu API Key en{" "}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                console.anthropic.com
              </a>
            </li>
            <li>• Cada análisis completo consume aproximadamente $0.05–0.15 USD.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
