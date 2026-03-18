// Disable Next.js caching so the rate is always fresh
export const revalidate = 0;
export const dynamic = "force-dynamic";

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            cache: "no-store",
            signal: controller.signal,
        });
        return res;
    } finally {
        clearTimeout(id);
    }
}

export async function GET() {
    // Primary: ve.dolarapi.com
    try {
        const res = await fetchWithTimeout("https://ve.dolarapi.com/v1/dolares/oficial");

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (typeof data.promedio !== "number" || data.promedio === null) {
            throw new Error("promedio inválido");
        }

        return Response.json({
            tasa: data.promedio as number,
            fechaActualizacion: data.fechaActualizacion as string,
        });
    } catch (primaryError) {
        console.warn("API primaria falló, intentando respaldo:", primaryError);
    }

    // Fallback: mismo proveedor pero endpoint general (lista todos los tipos)
    try {
        const res = await fetchWithTimeout("https://ve.dolarapi.com/v1/dolares");

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Buscar el tipo oficial en el array
        const oficial = Array.isArray(data)
            ? data.find((d: { fuente: string }) => d.fuente === "oficial")
            : null;

        const tasa = oficial?.promedio;
        if (typeof tasa !== "number") {
            throw new Error("tasa del respaldo inválida");
        }

        return Response.json({
            tasa: tasa as number,
            fechaActualizacion: oficial?.fechaActualizacion ?? new Date().toISOString(),
        });
    } catch (fallbackError) {
        console.error("API de respaldo también falló:", fallbackError);
        return Response.json(
            { error: "No se pudo obtener la tasa del dólar BCV" },
            { status: 503 }
        );
    }
}
