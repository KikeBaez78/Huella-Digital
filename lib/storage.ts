import { Negocio } from "./types";

const KEY = "huella_digital_negocios";
const CFG_KEY = "huella_digital_config";

export function getNegocios(): Negocio[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function getNegocio(id: string): Negocio | null {
  return getNegocios().find((n) => n.id === id) ?? null;
}

export function saveNegocio(negocio: Negocio): void {
  const lista = getNegocios().filter((n) => n.id !== negocio.id);
  localStorage.setItem(KEY, JSON.stringify([negocio, ...lista]));
}

export function deleteNegocio(id: string): void {
  const lista = getNegocios().filter((n) => n.id !== id);
  localStorage.setItem(KEY, JSON.stringify(lista));
}

export function getApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(CFG_KEY + "_apikey") || "";
}

export function setApiKey(key: string): void {
  localStorage.setItem(CFG_KEY + "_apikey", key);
}
