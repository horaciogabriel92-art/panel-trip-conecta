"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ErnestoProvider, useErnesto } from "@/context/ErnestoContext";
import { ErnestoSidebar } from "./components/ErnestoSidebar";

function isAllowedHost(host: string): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return host === "travel.quotixos.com" || host.startsWith("travel.quotixos.com:");
}

function ErnestoLayoutContent({ children }: { children: React.ReactNode }) {
  const { superadmin, isLoading } = useErnesto();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/ernestosplace/login";

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isAllowedHost(window.location.hostname)) {
      router.push("/");
      return;
    }

    if (!isLoading && !superadmin && !isLoginPage) {
      router.push("/ernestosplace/login");
    }
  }, [isLoading, superadmin, isLoginPage, router]);

  if (!isAllowedHost(typeof window !== "undefined" ? window.location.hostname : "")) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!superadmin && isLoginPage) {
    return <>{children}</>;
  }

  if (!superadmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      <ErnestoSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

export default function ErnestoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ErnestoProvider>
      <ErnestoLayoutContent>{children}</ErnestoLayoutContent>
    </ErnestoProvider>
  );
}
