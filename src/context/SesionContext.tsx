// src/context/SesionContext.tsx
import { createContext, useContext } from "react";

interface Sesion {
    usuario: { id: string; nombre: string };
    caja?: { id: string; nombre: string };
}
export const SesionContext = createContext<Sesion | null>(null);

export const useSesion = () => {
    const ctx = useContext(SesionContext);
    if (!ctx) throw new Error("useSesion debe usarse dentro de <SesionProvider>");
    return ctx;
};
