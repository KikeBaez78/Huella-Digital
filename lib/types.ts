export type EstadoProspecto =
  | "nuevo"
  | "contactado"
  | "propuesta_enviada"
  | "vendido"
  | "perdido";

export interface Negocio {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  giro?: string;
  fechaCreacion: string;
  estado: EstadoProspecto;
  analisis?: string;
  datosReales?: string;
  notas?: string;
}
