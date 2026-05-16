"use client";
import { EstadoProspecto } from "@/lib/types";

const COLORES: Record<EstadoProspecto, string> = {
  nuevo: "bg-blue-100 text-blue-700",
  contactado: "bg-yellow-100 text-yellow-700",
  propuesta_enviada: "bg-orange-100 text-orange-700",
  vendido: "bg-green-100 text-green-700",
  perdido: "bg-red-100 text-red-700",
};

const LABELS: Record<EstadoProspecto, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  propuesta_enviada: "Propuesta enviada",
  vendido: "Vendido",
  perdido: "Perdido",
};

export default function EstadoBadge({ estado }: { estado: EstadoProspecto }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${COLORES[estado]}`}>
      {LABELS[estado]}
    </span>
  );
}
