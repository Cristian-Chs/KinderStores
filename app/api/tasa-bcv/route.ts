// Fetch the official rate without caching (or with minimal caching)
export const revalidate = 0;

export async function GET() {
    try {
        const res = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
            cache: "no-store",
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
        console.error("Error fetching bcv rate:", error);
        return Response.json(
            { error: "No se pudo obtener la tasa del dolar BCV" },
            { status: 500 }
        );
    }
}
