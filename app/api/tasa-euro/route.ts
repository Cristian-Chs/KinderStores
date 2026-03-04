// Revalida cada hora — Next.js cacheará la respuesta en Vercel
export const revalidate = 3600;

export async function GET() {
    try {
        const res = await fetch("https://ve.dolarapi.com/v1/dolares/euro", {
            next: { revalidate: 3600 },
        });

        if (!res.ok) {
            throw new Error(`Error al obtener tasa: ${res.status}`);
        }

        const data = await res.json();

        return Response.json({
            tasa: data.promedio as number,
            fechaActualizacion: data.fechaActualizacion as string,
        });
    } catch (error) {
        console.error("Error fetching euro rate:", error);
        return Response.json(
            { error: "No se pudo obtener la tasa del euro" },
            { status: 500 }
        );
    }
}
