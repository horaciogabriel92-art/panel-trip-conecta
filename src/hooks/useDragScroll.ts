"use client";

import { useRef, useCallback, useEffect } from "react";

interface UseDragScrollOptions {
  direction?: "horizontal" | "vertical" | "both";
}

/**
 * Hook para hacer scroll arrastrando con el mouse (click + drag).
 * Útil para tablas o listas con scroll que no tienen barra visible o son difíciles de usar.
 */
export function useDragScroll<T extends HTMLElement>({ direction = "horizontal" }: UseDragScrollOptions = {}) {
  const ref = useRef<T>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    isDragging.current = true;
    startX.current = e.pageX - el.offsetLeft;
    startY.current = e.pageY - el.offsetTop;
    scrollLeft.current = el.scrollLeft;
    scrollTop.current = el.scrollTop;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    const el = ref.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const y = e.pageY - el.offsetTop;
    const walkX = (x - startX.current) * 1.2;
    const walkY = (y - startY.current) * 1.2;

    if (direction === "horizontal" || direction === "both") {
      el.scrollLeft = scrollLeft.current - walkX;
    }
    if (direction === "vertical" || direction === "both") {
      el.scrollTop = scrollTop.current - walkY;
    }
  }, [direction]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    const el = ref.current;
    if (el) {
      el.style.cursor = "grab";
      el.style.userSelect = "";
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
    const el = ref.current;
    if (el) {
      el.style.cursor = "grab";
      el.style.userSelect = "";
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.cursor = "grab";
    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseup", handleMouseUp);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseup", handleMouseUp);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave]);

  return ref;
}
