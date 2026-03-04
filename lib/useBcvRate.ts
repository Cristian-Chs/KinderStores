"use client";

import { useEffect, useState } from "react";

interface BcvRateState {
    tasa: number | null;
    fechaActualizacion: string | null;
    loading: boolean;
    error: boolean;
}

export function useBcvRate(): BcvRateState {
    const [state, setState] = useState<BcvRateState>({
        tasa: null,
        fechaActualizacion: null,
        loading: true,
        error: false,
    });

    useEffect(() => {
        let cancelled = false;

        async function fetchRate() {
            try {
                const res = await fetch("/api/tasa-bcv");
                if (!res.ok) throw new Error("Error de red");
                const data = await res.json();
                if (!cancelled) {
                    setState({
                        tasa: data.tasa,
                        fechaActualizacion: data.fechaActualizacion,
                        loading: false,
                        error: false,
                    });
                }
            } catch {
                if (!cancelled) {
                    setState((prev) => ({ ...prev, loading: false, error: true }));
                }
            }
        }

        fetchRate();
        return () => { cancelled = true; };
    }, []);

    return state;
}

/** Convierte un monto en dólares ($) a bolívares (Bs.) */
export function toBs(dollars: number, tasa: number): string {
    return (dollars * tasa).toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
