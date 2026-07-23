"use client";

import { useState } from "react";

interface FilterButtonsProps {
  destinos: string[];
  landing: any;
}

export default function FilterButtons({ destinos, landing }: FilterButtonsProps) {
  const [activo, setActivo] = useState("todos");

  const handleClick = (destino: string) => {
    setActivo(destino);
    const cards = document.querySelectorAll<HTMLElement>(".paquete-card");
    cards.forEach((card) => {
      const cardDestino = card.getAttribute("data-destino");
      if (destino === "todos" || cardDestino === destino) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  };

  if (destinos.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-10 justify-center">
      <button
        onClick={() => handleClick("todos")}
        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
          activo === "todos" ? "opacity-100" : "opacity-70 hover:opacity-100"
        }`}
        style={{ borderColor: "rgba(0,0,0,0.1)" }}
      >
        Todos
      </button>
      {destinos.map((destino) => (
        <button
          key={destino}
          onClick={() => handleClick(destino)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            activo === destino ? "opacity-100" : "opacity-70 hover:opacity-100"
          }`}
          style={{ borderColor: "rgba(0,0,0,0.1)" }}
        >
          {destino}
        </button>
      ))}
    </div>
  );
}
