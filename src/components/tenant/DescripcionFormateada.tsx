"use client";

interface DiaParseado {
  numero: number;
  titulo: string;
  descripcion: string;
}

interface DescripcionFormateadaProps {
  texto: string;
  colors: { primary: string; text: string };
  titulo?: string;
}

function parsearDescripcion(texto: string): DiaParseado[] | null {
  const lineas = texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lineas.length === 0) return null;

  const tieneDias = lineas.some((l) => /^D[IÍ]A\s*\d+/i.test(l));
  if (!tieneDias) return null;

  const dias: DiaParseado[] = [];
  let diaActual: DiaParseado | null = null;

  for (const linea of lineas) {
    const match = linea.match(/^D[IÍ]A\s*(\d+)[\s\-–—.:)]*(.*)$/i);
    if (match) {
      if (diaActual) dias.push(diaActual);
      diaActual = {
        numero: Number(match[1]),
        titulo: match[2].trim(),
        descripcion: "",
      };
    } else if (diaActual) {
      diaActual.descripcion += (diaActual.descripcion ? " " : "") + linea;
    }
  }
  if (diaActual) dias.push(diaActual);

  return dias.length > 0 ? dias : null;
}

export default function DescripcionFormateada({
  texto,
  colors,
  titulo = "Descripción",
}: DescripcionFormateadaProps) {
  const dias = parsearDescripcion(texto);

  return (
    <div className="bg-white rounded-2xl border border-black/10 p-6 md:p-8">
      <h2 className="text-xl font-bold mb-6" style={{ color: colors.text }}>
        {titulo}
      </h2>
      {dias ? (
        <div className="space-y-6">
          {dias.map((dia) => (
            <div key={dia.numero} className="flex gap-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: colors.primary }}
              >
                {dia.numero}
              </div>
              <div>
                <h3
                  className="font-semibold text-sm"
                  style={{ color: colors.text }}
                >
                  {dia.titulo || `Día ${dia.numero}`}
                </h3>
                <p className="text-sm opacity-70 mt-1">{dia.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="opacity-70 whitespace-pre-line">{texto}</p>
      )}
    </div>
  );
}
