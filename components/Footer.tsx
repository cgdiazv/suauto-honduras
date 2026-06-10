// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Su Auto Honduras. San Pedro Sula, Cortés. Todos los derechos reservados.
        </p>
        <div className="flex space-x-6 text-sm text-slate-400">
          <a href="/politica" className="hover:text-slate-500">Privacidad</a>
          <a href="/terminos" className="hover:text-slate-500">Términos</a>
          <a href="/contacto" className="hover:text-slate-500">Soporte</a>
        </div>
      </div>
    </footer>
  );
}