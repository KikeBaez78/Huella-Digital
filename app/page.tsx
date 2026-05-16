"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getNegocios, deleteNegocio } from "@/lib/storage";
import { Negocio, EstadoProspecto } from "@/lib/types";
import EstadoBadge from "@/components/EstadoBadge";
import {
  PlusCircle,
  Building2,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const ESTADOS: EstadoProspecto[] = [
  "nuevo",
  "contactado",
  "propuesta_enviada",
  "vendido",
  "perdido",
];

export default function Dashboard() {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [filtro, setFiltro] = useState<EstadoProspecto | "todos">("todos");

  useEffect(() => {
    setNegocios(getNegocios());
  }, []);

  function handleDelete(id: string) {
    if (!confirm("¿Eliminar este prospecto?")) return;
    deleteNegocio(id);
    setNegocios(getNegocios());
  }

  const filtrados =
    filtro === "todos" ? negocios : negocios.filter((n) => n.estado === filtro);

  const stats = {
    total: negocios.length,
    vendidos: negocios.filter((n) => n.estado === "vendido").length,
    activos: negocios.filter((n) =>
      ["nuevo", "contactado", "propuesta_enviada"].includes(n.estado)
    ).length,
    conAnalisis: negocios.filter((n) => n.analisis).length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de prospectos</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestiona tus análisis de negocios locales
          </p>
        </div>
        <Link
          href="/nuevo"
          className="flex items-center gap-2 bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Nuevo análisis
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total prospectos", value: stats.total, icon: Users, color: "text-blue-600" },
          { label: "Activos", value: stats.activos, icon: TrendingUp, color: "text-orange-600" },
          { label: "Vendidos", value: stats.vendidos, icon: CheckCircle2, color: "text-green-600" },
          { label: "Con análisis", value: stats.conAnalisis, icon: AlertCircle, color: "text-indigo-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-6">
        {(["todos", ...ESTADOS] as const).map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
              filtro === e
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300"
            }`}
          >
            {e === "todos"
              ? "Todos"
              : e === "nuevo"
              ? "Nuevos"
              : e === "contactado"
              ? "Contactados"
              : e === "propuesta_enviada"
              ? "Propuesta enviada"
              : e === "vendido"
              ? "Vendidos"
              : "Perdidos"}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            {negocios.length === 0
              ? "Aún no tienes prospectos"
              : "Sin resultados con este filtro"}
          </p>
          {negocios.length === 0 && (
            <Link
              href="/nuevo"
              className="mt-4 inline-flex items-center gap-2 text-indigo-600 font-medium text-sm hover:underline"
            >
              <PlusCircle className="w-4 h-4" />
              Crear tu primer análisis
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtrados.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{n.nombre}</div>
                  <div className="text-sm text-gray-500 truncate">{n.direccion}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(n.fechaCreacion).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <EstadoBadge estado={n.estado} />
                {n.analisis && (
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-medium">
                    Analizado
                  </span>
                )}
                <Link
                  href={`/analisis/${n.id}`}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Ver análisis"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
