export const metadata = {
  title: 'Organic UI - Trip Conecta B2B',
  description: 'Ejemplo de diseño Organic/Claymorphism',
};

export default function OrganicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d0d12] text-slate-100">
      {/* Fondo suave con gradiente orgánico */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/3 rounded-full blur-[150px]" />
      </div>
      
      {children}
    </div>
  );
}
