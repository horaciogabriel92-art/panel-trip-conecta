export const metadata = {
  title: 'Ejemplo UI - Trip Conecta B2B',
  description: 'Ejemplo de diseño UX/UI para el dashboard',
};

export default function EjemploUILayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-50">
      <div className="gradient-bg" />
      
      {/* Header simple */}
      <header className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-lg">Trip Conecta <span className="text-slate-500 font-normal">B2B</span></h1>
                <p className="text-xs text-slate-400">Ejemplo de UI/UX</p>
              </div>
            </div>
            
            <a 
              href="/login" 
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition-colors"
            >
              Ir al Login
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
