"use client";

import { useState, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface CheckoutPayload {
  plan_slug: string;
  extra_users?: number;
}

interface BillingUrlResponse {
  url: string;
}

export function useBilling() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const createCheckout = useCallback(async (payload: CheckoutPayload): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/billing/checkout`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear sesión de pago");
      }

      return (data as BillingUrlResponse).url;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPortal = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/billing/portal`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear portal de suscripción");
      }

      return (data as BillingUrlResponse).url;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/billing/cancel`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al cancelar suscripción");
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    createCheckout,
    createPortal,
    cancelSubscription,
  };
}
